import Telegraf from 'telegraf';
import { Session } from '../Session/Session';
import { TBotContext } from '../common/CommonTypes';
import { proxyAgent } from '../Agents/ProxyAgent';
import { Scene } from '../Scene/Scene';
import { SceneManager } from '../Scene/SceneManager';
export function ExampleSetup() {
    const bot = new Telegraf<TBotContext>(process.env.BOT_TOKEN, {
        telegram: { agent: proxyAgent },
    });

    const session = new Session({ logging: true });

    const exampleScene = new Scene('exampleName');
    exampleScene.enter(ctx =>
        ctx.reply('entering an example scene. /cancel to leave')
    );
    exampleScene.leave(ctx => ctx.reply('leaving an example scene'));
    exampleScene.composer.command('/example', ctx =>
        ctx.reply('inside of example scene')
    );
    exampleScene.composer.command('/cancel', ctx => ctx.scene.leave());
    exampleScene.composer.on('message', ctx =>
        ctx.reply(`you're inside a scene. allowed operations /cancel /example`)
    );

    const sceneManager = new SceneManager([exampleScene]);

    bot.use(session.middleware());
    bot.use(sceneManager.middleware());

    bot.start(ctx => ctx.reply('welcome'));

    bot.hears('show me an example scene', ctx =>
        ctx.scene.enter('exampleName')
    );

    bot.launch();
}
