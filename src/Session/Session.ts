import Lowdb, { LowdbSync } from 'lowdb';
import Memory from 'lowdb/adapters/Memory';
import {
    IStorageShape,
    ISessionOptions,
    ISessionContext,
} from './SessionTypes';

export class Session {
    storage: LowdbSync<IStorageShape>;
    options: ISessionOptions;
    constructor(options: ISessionOptions) {
        this.options = options;
        this.storage = Lowdb(new Memory<IStorageShape>('memorySession'));
    }

    getKey = ({ chat: { id, username } }: ISessionContext) => {
        return [id, username].join('---');
    };

    getOrCreateUserSession(ctx: ISessionContext) {
        // console.log(this.storage.getState());
        const userSession = this.storage.getState()[this.getKey(ctx)] || {
            scenes: { sceneActionIndex: null, activeSceneId: null },
        };
        this.options.logging &&
            console.log('session get or create', this.getKey(ctx), userSession);
        return userSession;
    }
    commitUserSession(ctx: ISessionContext) {
        this.options.logging &&
            console.log('session commit', this.getKey(ctx), ctx.session);
        return this.storage.set(this.getKey(ctx), ctx.session).write();
    }

    middleware() {
        /** кривые тайпинги next */
        return async (ctx: ISessionContext, next: () => any) => {
            ctx.session = this.getOrCreateUserSession(ctx);
            await next();
            this.commitUserSession(ctx);
        };
    }
}
