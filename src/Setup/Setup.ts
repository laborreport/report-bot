import Telegraf from 'telegraf';
import { proxyAgent } from '../utils/ProxyAgent';
import { Router } from '../router/Router';
import { Session } from '../Session/Session';
import { ISessionContext } from '../Session/SessionTypes';

export function Setup() {
    const bot = new Telegraf<ISessionContext>(process.env.BOT_TOKEN, {
        telegram: { agent: proxyAgent },
    });

    const session = new Session({ logging: true });
    bot.use(session.middleware());
    // const scene = new Scene();
    // bot.use(scene.middleware());
    Router(bot);

    bot.launch();
}
