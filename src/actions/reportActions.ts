import { TelegramFileService } from '../services/TelegramFileService';
import { ReportService } from '../services/ReportService';
import { ContextMessageUpdate } from 'telegraf';
import { Dict } from '../i18n';

export class ReportActions {
    static async sendProcessedDocumentReport(
        ctx: ContextMessageUpdate,
        documentFileId: string
    ) {
        try {
            const fileUrl = await ctx.telegram.getFileLink(documentFileId);

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
                ` ${Dict.errors.reportService}\n ${err.toString()}`
            );
        }
    }
}
