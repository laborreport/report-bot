import Telegraf from 'telegraf';
import { proxyAgent } from '../Agents/ProxyAgent';
import { Router } from '../router/Router';
import { Session } from '../Session/Session';
import { SceneManager } from '../Scene/SceneManager';
import { TBotContext } from '../common/CommonTypes';
import { CredentialsCreateScenes } from '../Scenes/Credentials/CredentialsCreate';
import { ActNumberScene } from '../Scenes/ActNumber/ActNumber';
import { CredentialsUseScene } from '../Scenes/Credentials/CredentialsUse';

export function Setup() {
    const bot = new Telegraf<TBotContext>(process.env.BOT_TOKEN, {
        telegram: { agent: proxyAgent },
    });

    const session = new Session({ logging: true });

    const sceneManager = new SceneManager([
        ...CredentialsCreateScenes,
        CredentialsUseScene,
        ActNumberScene,
    ]);
    bot.use(session.middleware());
    bot.use(sceneManager.middleware());

    Router(bot);

    bot.launch();
}
