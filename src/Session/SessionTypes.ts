import { ContextMessageUpdate } from 'telegraf';

export interface ISessionOptions {
    logging: boolean;
}

export interface IStorageShape {
    // TODO: fix
    [chatId: string]: {};
}

export interface ISessionContext extends ContextMessageUpdate {
    session: { [x: string]: string };
}
