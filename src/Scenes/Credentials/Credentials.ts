import { Scene } from '../../Scene/Scene';
import { TBotContext } from '../../common/CommonTypes';
import { exampleSceneName } from '../Example/Example';

const credentialsSceneName = 'credentials';
const credentialsScene = new Scene(credentialsSceneName);

credentialsScene.enter(ctx => ctx.reply('Надо кое что ввести'));
credentialsScene.leave(ctx => ctx.scene.enter(exampleSceneName));

credentialsScene.composer.command('cancel', ctx => ctx.scene.leave());
credentialsScene.composer.on('message', (ctx: TBotContext) =>
    Number(ctx.message.text) > 10 ? ctx.scene.leave() : ctx.reply('неа')
);
credentialsScene.composer.command('/inside', ctx =>
    ctx.reply('inside a scene credentials')
);
export { credentialsScene, credentialsSceneName };
