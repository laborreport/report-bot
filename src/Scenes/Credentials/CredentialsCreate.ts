import { Scene } from '../../Scene/Scene';
import { TBotContext } from '../../common/CommonTypes';

import * as JoiBase from '@hapi/joi';
import JoiDate from '@hapi/joi-date';
import Moment from 'moment';
import { ValidatorBlockedSceneFactory } from '../ValidatorBlockedSceneFactory/ValidatorBlockedSceneFactory';

const Joi: JoiBase.Root = JoiBase.extend(JoiDate);

export const DateFormat = 'DD.MM.YYYY';

enum EUserModelKeys {
    contractNumber = 'contractNumber',
    contractDate = 'contractDate',
    peSeries = 'peSeries',
    peNumber = 'peNumber',
    rate = 'rate',
}

const SceneMessagesMap = {
    [EUserModelKeys.contractNumber]: 'Введите номер договора',
    [EUserModelKeys.contractDate]: 'Введите дату заключения договора',
    [EUserModelKeys.peSeries]: 'Серия ИП',
    [EUserModelKeys.peNumber]: 'Номер ИП',
    [EUserModelKeys.rate]: 'Ставка',
};

export const UserModelSchema = JoiBase.object().keys({
    [EUserModelKeys.contractNumber]: Joi.number()
        .min(1)
        .max(99),
    [EUserModelKeys.contractDate]: Joi.date()
        .format(DateFormat)
        .options({ convert: true }),
    [EUserModelKeys.peSeries]: Joi.string().length(2),
    [EUserModelKeys.peNumber]: Joi.string().length(9),
    [EUserModelKeys.rate]: Joi.number()
        .min(0)
        .max(2000),
});

const submitMiddleware = (ctx: TBotContext) => {
    const {
        userModel: { contractDate, ...rest },
    } = ctx.session;
    ctx.session.userModel = {
        ...rest,
        contractDate: Moment(contractDate).format(DateFormat),
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

const CredentialsCreateSceneName = EUserModelKeys.contractNumber;
export { CredentialsCreateScenes, CredentialsCreateSceneName };
