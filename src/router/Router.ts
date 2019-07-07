import Telegraf, { ContextMessageUpdate } from 'telegraf';
import { TelegramFileService } from '../services/TelegramFileService';
import { ReportService } from '../services/ReportService';

export function Router(bot: Telegraf<ContextMessageUpdate>) {
    bot.start(ctx => ctx.reply('Welcome! send me a jira worksheet file.'));

    bot.on('document', async ctx => {
        const fileUrl = await ctx.telegram.getFileLink(
            ctx.message.document.file_id
        );

        const bufferFile = await TelegramFileService.getFile(fileUrl);

        const { buffer, filename } = await ReportService.getReport(bufferFile);
        return ctx.telegram.sendDocument(ctx.from.id, {
            source: buffer,
            filename,
        });
    });
}
