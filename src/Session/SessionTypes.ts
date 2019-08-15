import { IUserModel } from '../common/CommonTypes';

export interface ISessionOptions {
    logging: boolean;
}

export interface IUserSession {
    scenes?: {
        activeSceneId: string;
    };
    userModel?: Partial<IUserModel>;
}
export interface IStorageShape {
    [chatId: string]: IUserSession;
}
