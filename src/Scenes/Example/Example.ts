import { Scene } from '../../Scene/Scene';

const exampleSceneName = 'exampleScene';
const exampleScene = new Scene(exampleSceneName);
exampleScene.enter(ctx => ctx.reply('entered'));
exampleScene.leave(ctx => ctx.reply('exited'));

exampleScene.composer.command('cancel', ctx => ctx.scene.leave());
exampleScene.composer.command('/inside', ctx => ctx.reply('inside a scene'));
export { exampleScene, exampleSceneName };
