import Telegraf from 'telegraf';
import { BotAgent } from '../Agents/ProxyAgent';
import { Main } from '../Main/Main';
import { Session } from '../Session/Session';
import { SceneManager } from '../Scene/SceneManager';
import { TBotContext } from '../common/CommonTypes';
import { ActNumberScene } from '../Scenes/ActNumber/ActNumber';
import { SettingsSceneSet } from '../Scenes/Settings/SettingsSceneSet';

const identityGuard = (ctx, next) => {
    if (!ctx.from) {
        console.log('empty from');
        return;
    }
    return next();
};

export function Setup() {
    const bot = new Telegraf<TBotContext>(process.env.BOT_TOKEN, {
        telegram: { agent: BotAgent },
    });

    const session = new Session({ logging: true });

    const sceneManager = new SceneManager([
        ...SettingsSceneSet,
        ActNumberScene,
    ]);
    bot.use(identityGuard);
    bot.use(session.middleware());
    bot.use(sceneManager.middleware());

    Main(bot);

    bot.launch();
}
