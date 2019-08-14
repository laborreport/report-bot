import { ContextMessageUpdate } from 'telegraf';

export interface ISessionOptions {
    logging: boolean;
}

export interface IUserSession {
    scenes: {
        activeSceneId: string;
    };
}
export interface IStorageShape {
    [chatId: string]: IUserSession;
}
