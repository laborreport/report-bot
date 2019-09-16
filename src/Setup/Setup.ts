import Telegraf from 'telegraf';
import { proxyAgent } from '../Agents/ProxyAgent';
import { Main } from '../Main/Main';
import { Session } from '../Session/Session';
import { SceneManager } from '../Scene/SceneManager';
import { TBotContext } from '../common/CommonTypes';
import { ActNumberScene } from '../Scenes/ActNumber/ActNumber';
import { SettingsSceneSet } from '../Scenes/Settings/SettingsSceneSet';

export function Setup() {
    const bot = new Telegraf<TBotContext>(process.env.BOT_TOKEN, {
        telegram: { agent: proxyAgent },
    });

    const session = new Session({ logging: false });

    const sceneManager = new SceneManager([
        ...SettingsSceneSet,
        ActNumberScene,
    ]);
    bot.use(session.middleware());
    bot.use(sceneManager.middleware());

    Main(bot);

    bot.launch();
}
