import Telegraf, { Middleware } from 'telegraf';
import { proxyAgent } from '../Agents/ProxyAgent';
import { Router } from '../router/Router';
import { Session } from '../Session/Session';
import { SceneManager } from '../Scene/SceneManager';
import { TBotContext } from '../common/CommonTypes';
import { exampleScene } from '../Scenes/Example/Example';
import { CredentialScenes } from '../Scenes/Credentials/Credentials';

export function Setup() {
    const bot = new Telegraf<TBotContext>(process.env.BOT_TOKEN, {
        telegram: { agent: proxyAgent },
    });

    const session = new Session({ logging: true });

    const sceneManager = new SceneManager([exampleScene, ...CredentialScenes]);
    bot.use(session.middleware());
    bot.use(sceneManager.middleware());

    Router(bot);

    bot.launch();
}
