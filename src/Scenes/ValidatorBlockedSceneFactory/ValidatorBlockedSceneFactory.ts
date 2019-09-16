import { Scene } from '../../Scene/Scene';
import * as JoiBase from '@hapi/joi';
import { Middleware } from 'telegraf';
import { TBotContext } from '../../common/CommonTypes';

interface IValidatorBlockedSceneFactory<T> {
    name: string;
    validator: JoiBase.Schema;
    successHook: (result: T) => Middleware<TBotContext>;
    cancelHook: [string, Middleware<TBotContext>];
    enterHook?: Middleware<TBotContext>;
}
export const ValidatorBlockedSceneFactory = <T>({
    name,
    cancelHook,
    enterHook,
    successHook,
    validator,
}: IValidatorBlockedSceneFactory<T>) => {
    const scene = new Scene(name);
    scene.composer.command(cancelHook[0], cancelHook[1]);
    enterHook && scene.enter(enterHook);
    scene.composer.on('message', async ctx => {
        try {
            const result: T = await validator.validate(ctx.message.text as any);
            const hook = successHook(result);
            scene.leave(hook);
            ctx.scene.leave();
        } catch (err) {
            console.error(err);
            enterHook(ctx);
        }
    });

    return scene;
};
