import { Scene } from '../../Scene/Scene';
import { SceneAction } from '../../Scene/Action';
import { TBotContext } from '../../Setup/SetupTypes';

export const CredentialsScene = new Scene(
    '/credentials',
    [
        new SceneAction({
            question: 'раз',
            errorText: 'число должно быть',
            validator: (maybenunber: string) =>
                !Number.isNaN(Number(maybenunber)),
        }),
        new SceneAction({
            question: 'два',
            errorText: 'тоже число',
            validator: (maybenunber: string) =>
                !Number.isNaN(Number(maybenunber)),
        }),
    ],
    {
        onEnter: (ctx: TBotContext) => ctx.reply('onenter'),
        onLeave: (ctx: TBotContext) => ctx.reply('закончили упражнение'),
    }
);
