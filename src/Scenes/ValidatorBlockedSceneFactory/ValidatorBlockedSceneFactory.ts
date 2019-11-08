import { Scene } from '../../Scene/Scene';
import * as JoiBase from '@hapi/joi';
import { Middleware } from 'telegraf';
import { TBotContext } from '../../common/CommonTypes';
import { CANCEL_COMMAND } from '../../i18n';

interface IValidatorBlockedSceneFactory<T> {
    name: string;
    validator: JoiBase.Schema;
    successHook: (result: T, ctx: TBotContext) => any;
    enterHook?: Middleware<TBotContext>;
    cancelHook?: Middleware<TBotContext>;
}
export const ValidatorBlockedSceneFactory = <T>({
    name,
    enterHook,
    cancelHook,
    successHook,
    validator,
}: IValidatorBlockedSceneFactory<T>) => {
    const scene = new Scene(name);
    enterHook && scene.enter(enterHook);
    scene.composer.command(CANCEL_COMMAND, cancelHook);
    scene.composer.on('message', async ctx => {
        try {
            const result: T = await validator.validate(ctx.message.text as any);
            return successHook(result, ctx);
        } catch (err) {
            console.error(err);
            return enterHook(ctx);
        }
    });

    return scene;
};
