import { ContextMessageUpdate } from 'telegraf';

export interface ISessionOptions {
    logging: boolean;
}

interface IUserSession {
    scenes: {
        activeSceneId: string;
        sceneActionIndex: number;
    };
}
export interface IStorageShape {
    [chatId: string]: IUserSession;
}

export interface ISessionContext extends ContextMessageUpdate {
    session: IUserSession;
}
