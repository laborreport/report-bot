import { TelegramFileService } from '../services/TelegramFileService';
import { ReportService } from '../services/ReportService';
import { ContextMessageUpdate } from 'telegraf';
import { i18n } from '../i18n';

export class ReportActions {
    static async sendProcessedDocumentReport(
        ctx: ContextMessageUpdate,
        documentFileId: string
    ) {
        try {
            const fileUrl: string = await ctx.telegram.getFileLink(
                documentFileId
            );

            const worksheetFile: ArrayBuffer = await TelegramFileService.downloadFile(
                fileUrl
            );

            const {
                buffer: source,
                filename,
            } = await ReportService.getReportByWorksheet(worksheetFile);
            return ctx.telegram.sendDocument(ctx.from.id, {
                source,
                filename,
            });
        } catch (err) {
            return ctx.reply(
                ` ${i18n.errors.reportService}\n ${err.toString()}`
            );
        }
    }
}
