import { Scene } from './Scene';
import { Middleware, Composer } from 'telegraf';
import { TBotContext } from '../common/CommonTypes';

export interface ISceneManagerHooks {
    enter?: (sceneId: string) => void;
    leave?: () => void;
}

export class SceneManager {
    protected scenes: Map<string, Scene> = new Map();
    constructor(scenes: Scene[] = []) {
        this.scenes = new Map(scenes.map(scene => [scene.id, scene]));
    }

    private getActiveSceneId({
        session: { scenes: { activeSceneId } } = {
            scenes: { activeSceneId: null },
        },
    }: TBotContext) {
        return activeSceneId;
    }
    private checkWhetherSceneIsInProgress({
        session: { scenes: { activeSceneId } } = {
            scenes: { activeSceneId: null },
        },
    }: TBotContext) {
        return this.scenes.has(activeSceneId);
    }

    private enter(ctx: TBotContext) {
        return (sceneId: string) => {
            ctx.session.scenes.activeSceneId = sceneId;
            const {
                registeredHooks: { enter = () => {} },
            } = this.scenes.get(sceneId) || { registeredHooks: {} };
            enter(ctx);
        };
    }
    private leave(ctx: TBotContext) {
        const id = this.getActiveSceneId(ctx);
        ctx.session.scenes.activeSceneId = null;
        const {
            registeredHooks: { leave = () => {} },
        } = this.scenes.get(id) || { registeredHooks: {} };
        leave(ctx);
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
        next(ctx);
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
        next(ctx);
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
