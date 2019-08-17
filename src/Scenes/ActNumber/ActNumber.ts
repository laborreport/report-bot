import { ValidatorBlockedSceneFactory } from '../ValidatorBlockedSceneFactory/ValidatorBlockedSceneFactory';
import * as JoiBase from '@hapi/joi';

const ActNumberSceneName = 'ActNumberScene';

const ActNumberSceneValidator = JoiBase.number().min(1);

const ActNumberScene = ValidatorBlockedSceneFactory(
    ActNumberSceneName,
    ActNumberSceneValidator,
    (actNumber: string) => {
        return ctx => {
            ctx.session.actNumber = Number(actNumber);
            return ctx.reply('ok');
        };
    },
    ['/cancel', ctx => ctx.scene.leave()],
    ctx => ctx.reply('Введите номер акта')
);

export { ActNumberScene, ActNumberSceneName, ActNumberSceneValidator };
