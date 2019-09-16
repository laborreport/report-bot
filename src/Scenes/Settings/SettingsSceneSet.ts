import * as JoiBase from '@hapi/joi';
import JoiDate from '@hapi/joi-date';
import Moment from 'moment';

import { Scene } from '../../Scene/Scene';
import { TBotContext } from '../../common/CommonTypes';
import { ValidatorBlockedSceneFactory } from '../ValidatorBlockedSceneFactory/ValidatorBlockedSceneFactory';
import { ESettingsKeys, DateFormat } from '../../common/CommonConstants';
import { i18n, CANCEL_COMMAND } from '../../i18n';
import { helpers, processors } from '../../helpers/helpers';
import { Middleware } from 'telegraf';
import { Session } from '../../Session/Session';

const Joi: JoiBase.Root = JoiBase.extend(JoiDate);

export const SettingsSchema = JoiBase.object().keys({
    [ESettingsKeys.contract_number]: Joi.number()
        .min(1)
        .max(99)
        .required(),
    [ESettingsKeys.contract_date]: Joi.date()
        .format(DateFormat)
        .options({ convert: true })
        .required(),
    [ESettingsKeys.pe_series]: Joi.string()
        .length(2)
        .required(),
    [ESettingsKeys.pe_number]: Joi.string()
        .length(9)
        .required(),
    [ESettingsKeys.rate]: Joi.number()
        .min(0)
        .max(2000)
        .required(),
    [ESettingsKeys.act_number]: Joi.number().min(1),
});

const submitMiddleware = (ctx: TBotContext) => {
    return helpers
        .showSettings(ctx, processors.gatherCredentials(ctx, true))
        .then(() => {
            ctx.state.session = {
                ...ctx.state.session,
                tempSettings: {},
            };
            return ctx.scene.leave();
        });
};

const SettingsSceneSet: Scene[] = Object.entries(i18n.settingsEnterMessage).map(
    ([name, message], index) => {
        const scene = ValidatorBlockedSceneFactory({
            name,
            validator: Joi.reach(SettingsSchema, [name]),
            successHook: (result: string | Date, ctx: TBotContext) => {
                ctx.state.session.tempSettings = {
                    ...ctx.state.session.tempSettings,
                    [name]:
                        result instanceof Date
                            ? Moment(result).format(DateFormat)
                            : result,
                };

                const nextScene = Object.keys(i18n.settingsEnterMessage)[
                    index + 1
                ];
                if (nextScene) {
                    return ctx.scene.enter(nextScene);
                } else {
                    return submitMiddleware(ctx);
                }
            },
            enterHook: ctx => {
                console.log('---entering ', name, scene, ctx.state.session);

                return ctx.reply(message);
            },
            cancelHook: ctx => {
                console.log('---leaving ', name, scene, ctx.state.session);
                return helpers.messages.exit(ctx).then(ctx.scene.leave);
            },
        });

        return scene;
    }
);

const SettingsSceneSetName = ESettingsKeys.contract_number;
export { SettingsSceneSet, SettingsSceneSetName };
