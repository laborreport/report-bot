import { IUserSession } from '../Session/SessionTypes';
import { ContextMessageUpdate } from 'telegraf';
import { ISceneManagerHooks } from '../Scene/SceneManager';

export interface ISessionContext {
    state: {
        session: IUserSession;
    };
}

export interface ISceneContext {
    scene: ISceneManagerHooks;
}

export type TBotContext = ISessionContext &
    ISceneContext &
    ContextMessageUpdate;

export interface IUserModel {
    contract_number: string;
    contract_date: string;
    pe_number: string;
    pe_date: string;
    rate: number;
}

export interface ISettings extends IUserModel {
    act_number: number;
}
