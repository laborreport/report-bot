import Telegraf from 'telegraf';
import { proxyAgent } from './utils/ProxyAgent';
import { Router } from './router/Router';
import { Session } from './Session/Session';

export function setupBot() {
    const bot = new Telegraf(process.env.BOT_TOKEN, {
        telegram: { agent: proxyAgent },
    });

    const session = new Session({});

    Router(bot);

    bot.use(session.middleware());

    bot.launch();
}
