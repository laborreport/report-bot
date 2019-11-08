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

    getKey = (ctx: TBotContext) => {
        if (ctx.from && ctx.chat) {
            return `${ctx.from.id}:${ctx.chat.id}`;
        } else if (ctx.from && ctx.inlineQuery) {
            return `${ctx.from.id}:${ctx.from.id}`;
        }

        throw `---NO-SESSION-KEY ${JSON.stringify(ctx.from)} ${JSON.stringify(
            ctx.chat
        )}`;
    };

    getOrCreateUserSession(ctx: TBotContext) {
        const userSession = this.storage.getState()[this.getKey(ctx)] || {
            sessionId: this.getKey(ctx),
            scenes: {
                activeSceneId: null,
            },
            settings: {},
            tempSettings: {},
        };
        this.options.logging &&
            console.log(
                '<<< session get or create',
                this.getKey(ctx),
                userSession
            );
        return userSession;
    }
    commitUserSession(ctx: TBotContext) {
        this.options.logging &&
            console.log(
                '>>> session commit',
                this.getKey(ctx),
                '===',
                ctx.state.session.sessionId,
                ctx.state.session
            );

        if (ctx.state.session.sessionId !== this.getKey(ctx)) {
            console.error(
                '************************CRITICAL',
                'SESSIONCHANGE',
                this.getKey(ctx)
            );
            throw JSON.stringify(ctx.state.session);
        }

        return this.storage.set(this.getKey(ctx), ctx.state.session).write();
    }

    middleware() {
        /** кривые тайпинги next */
        return async (ctx: TBotContext, next: () => void) => {
            ctx.state.session = this.getOrCreateUserSession(ctx);
            await next();
            this.commitUserSession(ctx);
        };
    }
}
