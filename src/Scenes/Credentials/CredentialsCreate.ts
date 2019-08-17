import { Scene } from '../../Scene/Scene';
import { TBotContext, IUserModel } from '../../common/CommonTypes';

import * as JoiBase from '@hapi/joi';
import JoiDate from '@hapi/joi-date';
import Moment from 'moment';
import { ValidatorBlockedSceneFactory } from '../ValidatorBlockedSceneFactory/ValidatorBlockedSceneFactory';

const Joi: JoiBase.Root = JoiBase.extend(JoiDate);

export const DateFormat = 'DD.MM.YYYY';

enum EUserModelKeys {
    contract_number = 'contract_number',
    contract_date = 'contract_date',
    pe_series = 'pe_series',
    pe_number = 'pe_number',
    rate = 'rate',
}

const SceneMessagesMap = {
    [EUserModelKeys.contract_number]: 'Введите номер договора',
    [EUserModelKeys.contract_date]: 'Введите дату заключения договора',
    [EUserModelKeys.pe_series]: 'Серия ИП',
    [EUserModelKeys.pe_number]: 'Номер ИП',
    [EUserModelKeys.rate]: 'Ставка',
};

export const UserModelSchema = JoiBase.object().keys({
    [EUserModelKeys.contract_number]: Joi.number()
        .min(1)
        .max(99),
    [EUserModelKeys.contract_date]: Joi.date()
        .format(DateFormat)
        .options({ convert: true }),
    [EUserModelKeys.pe_series]: Joi.string().length(2),
    [EUserModelKeys.pe_number]: Joi.string().length(9),
    [EUserModelKeys.rate]: Joi.number()
        .min(0)
        .max(2000),
});

const submitMiddleware = (ctx: TBotContext) => {
    const { userModel } = ctx.session;
    const clearedUserModel = Object.keys(userModel)
        .filter(key => Object.values(EUserModelKeys).includes(key))
        .reduce<Partial<IUserModel>>((acc, key) => {
            return { ...acc, [key]: userModel[key] };
        }, {});

    ctx.session.userModel = clearedUserModel;

    const {
        userModel: { contract_date, ...rest },
    } = ctx.session;
    ctx.session.userModel = {
        ...rest,
        contract_date: Moment(contract_date).format(DateFormat),
    };
    ctx.reply(JSON.stringify(ctx.session.userModel));
};

const CredentialsCreateScenes: Scene[] = Object.entries(SceneMessagesMap).map(
    ([name, message], index) => {
        const scene = ValidatorBlockedSceneFactory(
            name,
            Joi.reach(UserModelSchema, [name]),
            (result: string) => {
                return ctx => {
                    ctx.session.userModel = {
                        ...ctx.session.userModel,
                        [name]: result,
                    };

                    const nextScene = Object.keys(SceneMessagesMap)[index + 1];
                    ctx.session.userModel[name] && ctx.scene.enter(nextScene);

                    !nextScene && submitMiddleware(ctx);
                };
            },
            ['/cancel', ctx => ctx.scene.leave()],
            ctx => ctx.reply(message)
        );

        return scene;
    }
);

const CredentialsCreateSceneName = EUserModelKeys.contract_number;
export { CredentialsCreateScenes, CredentialsCreateSceneName };
