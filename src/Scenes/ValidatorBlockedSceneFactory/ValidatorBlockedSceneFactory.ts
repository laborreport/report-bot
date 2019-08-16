import { Scene } from '../../Scene/Scene';
import * as JoiBase from '@hapi/joi';
import { Middleware } from 'telegraf';
import { TBotContext } from '../../common/CommonTypes';

export const ValidatorBlockedSceneFactory = (
    name: string,
    message: string,
    validator: JoiBase.Schema,
    successHook: (result: string) => Middleware<TBotContext>
) => {
    const scene = new Scene(name);
    scene.enter(ctx => ctx.reply(message));
    scene.composer.on('message', async ctx => {
        try {
            const result = await validator.validate(ctx.message.text);
            const hook = successHook(result);
            scene.leave(hook);
            ctx.scene.leave();
        } catch (err) {
            console.error(err);
            ctx.reply(message);
        }
    });

    return scene;
};
