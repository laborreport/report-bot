import { TBotContext } from '../Setup/SetupTypes';
import { SceneAction } from './Action';

type Handler = (ctx: TBotContext) => void;

interface ISceneHooks {
    onEnter: Handler;
    onLeave: Handler;
}

export class Scene {
    public id: string;

    private steps: SceneAction[];
    private hooks: ISceneHooks;

    constructor(id: string, steps: SceneAction[], hooks: ISceneHooks) {
        this.id = id;
        this.steps = steps;
        this.hooks = hooks;

        if (this.steps.length < 1)
            throw new Error('At least 1 Action must be provided to Scene');
    }

    registerSceneInSession(ctx: TBotContext) {
        ctx.session.scenes = {
            activeSceneId: this.id,
            sceneActionIndex: 0,
        };
    }

    clearSceneFromSession(ctx: TBotContext) {
        ctx.session.scenes = {
            activeSceneId: null,
            sceneActionIndex: null,
        };
    }

    private getActiveActionByIndex({
        session: {
            scenes: { sceneActionIndex },
        },
    }: TBotContext) {
        const step = this.steps[sceneActionIndex];
        return step;
    }

    private getNextStep(ctx: TBotContext) {
        ctx.session.scenes.sceneActionIndex += 1;
        return this.getActiveActionByIndex(ctx);
    }

    private handleLeave(ctx: TBotContext) {
        this.hooks.onLeave(ctx);
        this.clearSceneFromSession(ctx);
    }
    private handleEnter(ctx: TBotContext) {
        this.hooks.onEnter(ctx);
        this.registerSceneInSession(ctx);
        this.perform(ctx);
    }

    private nextStep(ctx: TBotContext) {
        const nextStep = this.getNextStep(ctx);
        if (nextStep) {
            nextStep.perform(ctx);
        } else {
            this.handleLeave(ctx);
        }
    }

    public perform(ctx: TBotContext) {
        const activeAction = this.getActiveActionByIndex(ctx);
        activeAction.check(ctx)
            ? this.nextStep(ctx)
            : activeAction.sendValidationError(ctx);
    }

    public enter(ctx: TBotContext) {
        return this.handleEnter(ctx);
    }
}
