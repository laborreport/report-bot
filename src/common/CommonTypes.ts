import { IUserSession } from '../Session/SessionTypes';
import { ContextMessageUpdate } from 'telegraf';
import { ISceneManagerHooks } from '../Scene/SceneManager';

export interface ISessionContext {
    session: IUserSession;
}

export interface ISceneContext {
    scene: ISceneManagerHooks;
}

export type TBotContext = ISessionContext &
    ISceneContext &
    ContextMessageUpdate;

export interface IUserModel {
    contractNumber: string;
    contractDate: string;
    peSeries: string;
    peNumber: string;
    rate: number;
}
