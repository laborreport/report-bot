// lowdb
import { ContextMessageUpdate } from 'telegraf';
import Lowdb, { LowdbSync } from 'lowdb';
import Memory from 'lowdb/adapters/Memory';

interface ISessionOptions {}

interface IStorageShape {}

interface ISessionContext extends ContextMessageUpdate {
    session: { [x: string]: string };
}
export class Session {
    storage: LowdbSync<IStorageShape>;
    options: ISessionOptions;
    constructor(options: ISessionOptions) {
        this.options = options;

        this.storage = Lowdb(new Memory<IStorageShape>('memorySession'));
    }

    getChatSession({ chat: { id } }: ISessionContext) {
        // this.storage
        return { status: 'sessionWorking' };
    }

    middleware() {
        /** кривые тайпинги next */
        return (ctx: ISessionContext, next: () => any) => {
            ctx.session = this.getChatSession(ctx);
            next();
        };
    }
}
