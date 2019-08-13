import { TBotContext } from '../Setup/SetupTypes';
import { Scene } from './Scene';

export class SceneManager {
    scenes: Scene[] = [];
    constructor(scenes: Scene[]) {
        this.scenes = scenes;
    }

    getActiveScene({
        session: { scenes: { activeSceneId } } = {
            scenes: { activeSceneId: null, sceneActionIndex: null },
        },
    }: TBotContext) {
        const [activeScene] = this.scenes.filter(
            ({ id }) => id === activeSceneId
        );
        return activeScene;
    }
    checkWhetherSceneIsInProgress({
        session: { scenes: { activeSceneId } } = {
            scenes: { activeSceneId: null, sceneActionIndex: null },
        },
    }: TBotContext) {
        return this.scenes.some(({ id }) => id === activeSceneId);
    }
    middleware() {
        return (ctx: TBotContext, next: () => void) => {
            if (this.checkWhetherSceneIsInProgress(ctx)) {
                const scene = this.getActiveScene(ctx);
                scene.perform(ctx);
            } else {
                next();
            }
        };
    }
}
