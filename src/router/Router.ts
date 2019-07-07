import Telegraf, { ContextMessageUpdate } from 'telegraf';
import { TelegramFileService } from '../services/TelegramFileService';
import { ReportService } from '../services/ReportService';
import { ReportActions } from '../actions/reportActions';

export function Router(bot: Telegraf<ContextMessageUpdate>) {
    bot.start(ctx => ctx.reply('Welcome! send me a jira worksheet file.'));

    bot.on('document', async ctx => {
        ReportActions.sendProcessedDocumentReport(ctx);
    });
}
