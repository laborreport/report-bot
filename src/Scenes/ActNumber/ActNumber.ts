import { ValidatorBlockedSceneFactory } from '../ValidatorBlockedSceneFactory/ValidatorBlockedSceneFactory';
import * as JoiBase from '@hapi/joi';
import { i18n, CANCEL_COMMAND } from '../../i18n';
import { SettingsSchema } from '../Settings/SettingsSceneSet';
import { ESettingsKeys } from '../../common/CommonConstants';
import { helpers } from '../../helpers/helpers';

const ActNumberSceneName = 'ActNumberScene';

const ActNumberScene = ValidatorBlockedSceneFactory({
    name: ActNumberSceneName,
    validator: JoiBase.reach(SettingsSchema, ESettingsKeys.act_number),
    successHook: (act_number: string) => {
        return ctx => {
            ctx.session.settings = {
                ...ctx.session.settings,
                act_number: Number(act_number),
            };
            return ctx.reply(i18n.actNumber.actNumberChanged);
        };
    },
    cancelHook: [
        CANCEL_COMMAND,
        ctx => {
            helpers.messages.exit(ctx);
            ctx.scene.leave();
        },
    ],
    enterHook: ctx =>
        ctx.reply(i18n.settingsEnterMessage[ESettingsKeys.act_number]),
});

export { ActNumberScene, ActNumberSceneName };
