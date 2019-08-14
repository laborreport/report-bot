import { TBotContext } from '../Setup/SetupTypes';
import { Scene } from './Scene';
import { Middleware, Composer } from 'telegraf';

export interface ISceneManagerHooks {
    enter?: (sceneId: string) => void;
    leave?: () => void;
}

export class SceneManager {
    scenes: Map<string, Scene> = new Map();
    constructor(scenes: Scene[] = []) {
        this.scenes = new Map(scenes.map(scene => [scene.id, scene]));
    }

    getActiveSceneId({
        session: { scenes: { activeSceneId } } = {
            scenes: { activeSceneId: null },
        },
    }: TBotContext) {
        return activeSceneId;
    }
    getActiveScene(ctx: TBotContext) {
        return this.scenes.get(this.getActiveSceneId(ctx));
    }
    checkWhetherSceneIsInProgress({
        session: { scenes: { activeSceneId } } = {
            scenes: { activeSceneId: null },
        },
    }: TBotContext) {
        console.log('SCENE_CHECK', activeSceneId);
        return this.scenes.has(activeSceneId);
    }

    startScene(ctx: TBotContext) {
        return (sceneId: string) => {
            ctx.session.scenes.activeSceneId = sceneId;
            this.scenes.get(sceneId).registeredHooks.enter(ctx);
        };
    }
    leaveCurrentScene(ctx: TBotContext) {
        const id = this.getActiveSceneId(ctx);
        ctx.session.scenes.activeSceneId = null;
        this.scenes.get(id).registeredHooks.leave(ctx);
    }

    sceneHooks = (ctx: TBotContext): ISceneManagerHooks => ({
        enter: this.startScene(ctx),
        leave: () => {
            this.leaveCurrentScene(ctx);
        },
    });

    private sceneInProgressMiddleware = (ctx: TBotContext) => {
        return this.checkWhetherSceneIsInProgress(ctx);
    };

    sceneLeaveMixinMiddleware = (
        ctx: TBotContext,
        next: Middleware<TBotContext>
    ) => {
        const { leave } = this.sceneHooks(ctx);
        ctx.scene = {
            leave,
        };
        next(ctx);
    };
    sceneEnterMixinMiddleware = (
        ctx: TBotContext,
        next: Middleware<TBotContext>
    ) => {
        const { enter } = this.sceneHooks(ctx);
        ctx.scene = {
            enter,
        };
        next(ctx);
    };

    middleware() {
        return Composer.branch(
            this.sceneInProgressMiddleware,
            Composer.compose([
                this.sceneLeaveMixinMiddleware,
                ...Array.from(this.scenes).map(([key, scene]) => {
                    return Composer.optional(
                        ctx => this.getActiveSceneId(ctx) === key,
                        scene.middleware()
                    );
                }),
            ]),
            this.sceneEnterMixinMiddleware
        );
    }
}
