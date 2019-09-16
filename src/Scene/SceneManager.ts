import { Scene } from './Scene';
import { Middleware, Composer } from 'telegraf';
import { TBotContext } from '../common/CommonTypes';

export interface ISceneManagerHooks {
    enter?: (sceneId: string) => Promise<any>;
    leave?: () => void;
}

export class SceneManager {
    protected scenes: Map<string, Scene> = new Map();
    constructor(scenes: Scene[] = []) {
        this.scenes = new Map(scenes.map(scene => [scene.id, scene]));
    }

    private getActiveSceneId({
        state: {
            session: { scenes: { activeSceneId } } = {
                scenes: { activeSceneId: null },
            },
        },
    }: TBotContext) {
        return activeSceneId;
    }
    private checkWhetherSceneIsInProgress({
        state: {
            session: { scenes: { activeSceneId } } = {
                scenes: { activeSceneId: null },
            },
        },
    }: TBotContext) {
        return this.scenes.has(activeSceneId);
    }

    private enter(ctx: TBotContext) {
        return (sceneId: string) => {
            ctx.state.session.scenes.activeSceneId = sceneId;
            const {
                registeredHooks: { enter = () => {} },
            } = this.scenes.get(sceneId) || { registeredHooks: {} };
            return enter(ctx);
        };
    }
    private leave(ctx: TBotContext) {
        const id = this.getActiveSceneId(ctx);
        ctx.state.session.scenes.activeSceneId = null;
        const {
            registeredHooks: { leave = () => {} },
        } = this.scenes.get(id) || { registeredHooks: {} };
        return leave(ctx);
    }

    private sceneHooks = (ctx: TBotContext): ISceneManagerHooks => ({
        enter: this.enter(ctx),
        leave: () => this.leave(ctx),
    });

    private checkSceneInProgressMiddleware = (ctx: TBotContext) => {
        return this.checkWhetherSceneIsInProgress(ctx);
    };

    private injectLeaveHookMiddleware = (
        ctx: TBotContext,
        next: Middleware<TBotContext>
    ) => {
        const { leave } = this.sceneHooks(ctx);
        ctx.scene = {
            ...ctx.scene,
            leave,
        };
        return next(ctx);
    };
    private injectEnterHookMiddleware = (
        ctx: TBotContext,
        next: Middleware<TBotContext>
    ) => {
        const { enter } = this.sceneHooks(ctx);
        ctx.scene = {
            ...ctx.scene,
            enter,
        };
        return next(ctx);
    };

    public middleware() {
        return Composer.branch(
            this.checkSceneInProgressMiddleware,
            Composer.compose([
                this.injectLeaveHookMiddleware,
                this.injectEnterHookMiddleware,
                ...Array.from(this.scenes).map(([key, scene]) => {
                    return Composer.optional(
                        ctx => this.getActiveSceneId(ctx) === key,
                        scene.middleware()
                    );
                }),
            ]),
            this.injectEnterHookMiddleware
        );
    }
}
