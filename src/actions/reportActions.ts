import { TelegramFileService } from '../services/TelegramFileService';
import { ReportService } from '../services/ReportService';
import { ContextMessageUpdate } from 'telegraf';

export class ReportActions {
    static async sendProcessedDocumentReport(ctx: ContextMessageUpdate) {
        try {
            const fileUrl = await ctx.telegram.getFileLink(
                ctx.message.document.file_id
            );

            const bufferFile = await TelegramFileService.getFile(fileUrl);

            const { buffer, filename } = await ReportService.getReport(
                bufferFile
            );
            return ctx.telegram.sendDocument(ctx.from.id, {
                source: buffer,
                filename,
            });
        } catch (err) {
            return ctx.reply(
                `I caught an error processing a document 😔 \n ${err.toString()}`
            );
        }
    }
}
