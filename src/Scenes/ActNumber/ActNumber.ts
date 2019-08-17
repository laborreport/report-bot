import { ValidatorBlockedSceneFactory } from '../ValidatorBlockedSceneFactory/ValidatorBlockedSceneFactory';
import * as JoiBase from '@hapi/joi';

const ActNumberSceneName = 'ActNumberScene';

const ActNumberSceneValidator = JoiBase.number().min(1);

const ActNumberScene = ValidatorBlockedSceneFactory(
    ActNumberSceneName,
    ActNumberSceneValidator,
    (act_number: string) => {
        return ctx => {
            ctx.session.act_number = Number(act_number);
            return ctx.reply('ok');
        };
    },
    ['/cancel', ctx => ctx.scene.leave()],
    ctx => ctx.reply('Введите номер акта')
);

export { ActNumberScene, ActNumberSceneName, ActNumberSceneValidator };
