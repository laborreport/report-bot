import Telegraf from 'telegraf';
import { i18n } from '../i18n';
import { TBotContext } from '../common/CommonTypes';
import { exampleSceneName } from '../Scenes/Example/Example';
import { CredentialsSceneName } from '../Scenes/Credentials/Credentials';
import { workSheetSceneName } from '../Scenes/WorkSheet/Worksheet';

export function Router(bot: Telegraf<TBotContext>) {
    bot.start(ctx => ctx.reply(i18n.welcome));

    bot.command('/example', ctx => ctx.scene.enter(exampleSceneName));
    bot.command('/credentials', ctx => ctx.scene.enter(CredentialsSceneName));

    bot.on('document', ctx => ctx.scene.enter(workSheetSceneName));
}
