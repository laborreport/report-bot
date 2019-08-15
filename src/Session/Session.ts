import Lowdb, { LowdbSync } from 'lowdb';
import Memory from 'lowdb/adapters/Memory';
import { IStorageShape, ISessionOptions } from './SessionTypes';
import { TBotContext } from '../common/CommonTypes';
import { Middleware } from 'telegraf';

export class Session {
    storage: LowdbSync<IStorageShape>;
    options: ISessionOptions;
    constructor(options: ISessionOptions) {
        this.options = options;
        this.storage = Lowdb(new Memory<IStorageShape>('memorySession'));
    }

    getKey = ({ chat: { id, username } }: TBotContext) => {
        return [id, username].join('---');
    };

    getOrCreateUserSession(ctx: TBotContext) {
        const userSession = this.storage.getState()[this.getKey(ctx)] || {
            scenes: {
                activeSceneId: null,
            },
        };
        this.options.logging &&
            console.log('session get or create', this.getKey(ctx), userSession);
        return userSession;
    }
    commitUserSession(ctx: TBotContext) {
        this.options.logging &&
            console.log('session commit', this.getKey(ctx), ctx.session);
        return this.storage.set(this.getKey(ctx), ctx.session).write();
    }

    middleware() {
        /** кривые тайпинги next */
        return async (ctx: TBotContext, next: Middleware<TBotContext>) => {
            ctx.session = this.getOrCreateUserSession(ctx);
            await next(ctx);
            this.commitUserSession(ctx);
        };
    }
}
