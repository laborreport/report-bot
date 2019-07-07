import Telegraf, { ContextMessageUpdate, Extra } from 'telegraf';
import {
    DocumentActionsKeyboard,
    IDocumentActionsButton as IDocumentActionsButtonData,
} from '../keyboards/DocumentActionsKeyboard';
import { ReportActions } from '../actions/reportActions';
import { DocumentProcessingType } from '../constants/Constants';

export function Router(bot: Telegraf<ContextMessageUpdate>) {
    bot.start(ctx => ctx.reply('Welcome! send me a jira worksheet file.'));

    bot.on('document', async ctx => {
        return ctx.reply('how to process a document?', {
            reply_markup: DocumentActionsKeyboard,
            reply_to_message_id: ctx.message.message_id,
        });
    });
    bot.on('callback_query', ctx => {
        try {
            const { action }: IDocumentActionsButtonData = JSON.parse(
                ctx.callbackQuery.data
            );
            const documentFileId =
                ctx.callbackQuery.message.reply_to_message.document.file_id;
            switch (action) {
                case DocumentProcessingType.WORKSHEET:
                    return ReportActions.sendProcessedDocumentReport(
                        ctx,
                        documentFileId
                    );
                default:
                    return ctx.reply('Could not resolve this button. Sorry 😔');
            }
        } catch (err) {
            return ctx.reply(
                'Could not resolve this button. Sorry 😔. Data is broken'
            );
        }
    });
}
