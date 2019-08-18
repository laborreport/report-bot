import { ValidatorBlockedSceneFactory } from '../ValidatorBlockedSceneFactory/ValidatorBlockedSceneFactory';
import * as JoiBase from '@hapi/joi';
import { i18n } from '../../i18n';

const ActNumberSceneName = 'ActNumberScene';

const ActNumberSceneValidator = JoiBase.number().min(1);

const ActNumberScene = ValidatorBlockedSceneFactory(
    ActNumberSceneName,
    ActNumberSceneValidator,
    (act_number: string) => {
        return ctx => {
            ctx.session.act_number = Number(act_number);
            return ctx.reply(i18n.actNumber.actNumberChanged);
        };
    },
    ['/cancel', ctx => ctx.scene.leave()],
    ctx => ctx.reply(i18n.actNumber.enterActNumber)
);

export { ActNumberScene, ActNumberSceneName, ActNumberSceneValidator };
