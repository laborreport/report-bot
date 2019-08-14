import Telegraf, { Middleware } from 'telegraf';
import { proxyAgent } from '../utils/ProxyAgent';
import { Router } from '../router/Router';
import { Session } from '../Session/Session';
import { SceneManager } from '../Scene/SceneManager';
import { TBotContext } from './SetupTypes';
import { Scene } from '../Scene/Scene';

export function Setup() {
    const bot = new Telegraf<TBotContext>(process.env.BOT_TOKEN, {
        telegram: { agent: proxyAgent },
    });

    const session = new Session({ logging: true });

    const example = new Scene('name');
    example.enter(ctx => ctx.reply('entered'));
    example.leave(ctx => ctx.reply('exited'));

    example.composer.command('cancel', ctx => ctx.scene.leave());
    example.composer.command('/inside', ctx => ctx.reply('inside a scene'));

    const sceneManager = new SceneManager([example]);
    bot.use(session.middleware());
    bot.use(sceneManager.middleware());

    bot.command('enter', ctx => ctx.scene.enter('name'));
    bot.command('isoutside', ctx => ctx.reply('ok'));
    Router(bot);

    bot.launch();
}
