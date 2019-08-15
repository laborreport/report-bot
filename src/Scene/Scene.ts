import { Composer, Middleware } from 'telegraf';
import { TBotContext } from '../common/CommonTypes';

interface ISceneHooks {
    enter?: Middleware<TBotContext>;
    leave?: Middleware<TBotContext>;
}

export class Scene {
    public composer: Composer<TBotContext>;
    public id: string;
    public registeredHooks: ISceneHooks = {};

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

    public middleware(): Middleware<TBotContext> {
        // TODO: fix when proper typing will be provided by telegraf
        return ((this.composer as unknown) as any).middleware();
    }
}
