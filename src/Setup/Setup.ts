import Telegraf from 'telegraf';
import { proxyAgent } from '../Agents/ProxyAgent';
import { Main } from '../Main/Main';
import { Session } from '../Session/Session';
import { SceneManager } from '../Scene/SceneManager';
import { TBotContext } from '../common/CommonTypes';
import { CredentialsCreateScenes } from '../Scenes/Credentials/CredentialsCreate';
import { ActNumberScene } from '../Scenes/ActNumber/ActNumber';

export function Setup() {
    const bot = new Telegraf<TBotContext>(process.env.BOT_TOKEN, {
        telegram: { agent: proxyAgent },
    });

    const session = new Session({ logging: true });

    const sceneManager = new SceneManager([
        ...CredentialsCreateScenes,
        ActNumberScene,
    ]);
    bot.use(session.middleware());
    bot.use(sceneManager.middleware());

    Main(bot);

    bot.launch();
}
