import Telegraf from 'telegraf';
import { proxyAgent } from './utils/ProxyAgent';
import { Router } from './router/Router';

export function setupBot() {
    const bot = new Telegraf(process.env.BOT_TOKEN, {
        telegram: { agent: proxyAgent },
    });

    Router(bot);

    bot.launch();
}
