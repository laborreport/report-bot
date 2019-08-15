export interface ISessionOptions {
    logging: boolean;
}

export interface IUserSession {
    scenes?: {
        activeSceneId: string;
    };
    wizard?: {
        activeIndex: number;
    };
}
export interface IStorageShape {
    [chatId: string]: IUserSession;
}
