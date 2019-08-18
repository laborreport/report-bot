import * as JoiBase from '@hapi/joi';
import JoiDate from '@hapi/joi-date';
import Moment from 'moment';

import { Scene } from '../../Scene/Scene';
import { TBotContext, IUserModel } from '../../common/CommonTypes';
import { ValidatorBlockedSceneFactory } from '../ValidatorBlockedSceneFactory/ValidatorBlockedSceneFactory';
import { EUserModelKeys, DateFormat } from '../../common/CommonConstants';
import { i18n, settingsFormatter } from '../../i18n';

const Joi: JoiBase.Root = JoiBase.extend(JoiDate);

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

const setToSessionOnlyNeccesaryFields = (ctx: TBotContext) => {
    const { userModel } = ctx.session;
    const { contract_date, ...rest } = Object.keys(userModel)
        .filter(key => Object.values(EUserModelKeys).includes(key))
        .reduce<Partial<IUserModel>>((acc, key) => {
            return { ...acc, [key]: userModel[key] };
        }, {});

    ctx.session.userModel = {
        ...rest,
        contract_date: Moment(contract_date).format(DateFormat),
    };

    return ctx.session.userModel;
};
const submitMiddleware = (ctx: TBotContext) => {
    const userModel = setToSessionOnlyNeccesaryFields(ctx);
    ctx.reply(settingsFormatter(userModel));
};

const CredentialsCreateScenes: Scene[] = Object.entries(
    i18n.credentialsEnterMessage
).map(([name, message], index) => {
    const scene = ValidatorBlockedSceneFactory(
        name,
        Joi.reach(UserModelSchema, [name]),
        (result: string) => {
            return ctx => {
                ctx.session.userModel = {
                    ...ctx.session.userModel,
                    [name]: result,
                };

                const nextScene = Object.keys(i18n.credentialsEnterMessage)[
                    index + 1
                ];
                ctx.session.userModel[name] && ctx.scene.enter(nextScene);

                !nextScene && submitMiddleware(ctx);
            };
        },
        ['/cancel', ctx => ctx.scene.leave()],
        ctx => ctx.reply(message)
    );

    return scene;
});

const CredentialsCreateSceneName = EUserModelKeys.contract_number;
export { CredentialsCreateScenes, CredentialsCreateSceneName };
