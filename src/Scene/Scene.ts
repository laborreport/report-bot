import { TBotContext } from '../Setup/SetupTypes';
import { Composer, Middleware } from 'telegraf';

export class Scene {
    public composer: Composer<TBotContext>;
    public id: string;
    public registeredHooks: {
        enter: Middleware<TBotContext>;
        leave: Middleware<TBotContext>;
    } = {
        // TODO:remove
        enter: ctx => ctx.reply('empty enter'),
        leave: ctx => ctx.reply('empty leave'),
    };

    constructor(id: string) {
        this.composer = new Composer();
        this.id = id;
    }

    public enter(handler: Middleware<TBotContext>) {
        this.registeredHooks.enter = handler;
    }
    public leave(handler: Middleware<TBotContext>) {
        this.registeredHooks.leave = handler;
    }

    middleware(): Middleware<TBotContext> {
        return ((this.composer as unknown) as any).middleware();
    }
}
