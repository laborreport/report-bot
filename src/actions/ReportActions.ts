import { TelegramFileService } from '../services/TelegramFileService';
import { ReportService } from '../services/ReportService';
import { i18n } from '../i18n';
import { TBotContext, IUserModel } from '../common/CommonTypes';
import { EDocFormat } from '../common/CommonConstants';
import Moment from 'moment';
import { DateFormat } from '../Scenes/Credentials/CredentialsCreate';

export class ReportActions {
    static async sendProcessedDocumentReport(
        ctx: TBotContext,
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
    static async sendActDocument(
        ctx: TBotContext,
        options: {
            documentFileId: string;
            docFormat: EDocFormat;
            user: Partial<IUserModel>;
            act_number: number;
        }
    ) {
        try {
            const fileUrl: string = await ctx.telegram.getFileLink(
                options.documentFileId
            );

            const worksheetFile: ArrayBuffer = await TelegramFileService.downloadFile(
                fileUrl
            );

            // const { contract_date, ...restUser } = options.user;

            // const user = {
            //     contract_date: Moment(contract_date, DateFormat).toISOString(),
            //     ...restUser,
            // };

            console.log(
                'QQ',
                options.user,
                options.act_number,
                options.docFormat,
                options.documentFileId
            );
            const {
                buffer: source,
                filename,
            } = await ReportService.getActByWorksheet(
                worksheetFile,
                options.docFormat,
                options.user,
                options.act_number
            );
            return ctx.telegram.sendDocument(ctx.from.id, {
                source,
                filename,
            });
        } catch (err) {
            console.error(err);
            return ctx.reply(
                ` ${i18n.errors.reportService}\n ${err.toString()}`
            );
        }
    }
}
