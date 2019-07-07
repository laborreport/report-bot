import Telegraf, { ContextMessageUpdate } from 'telegraf';
import {
    DocumentActionsKeyboard,
    IDocumentActionsButton as IDocumentActionsButtonData,
} from '../keyboards/DocumentActionsKeyboard';
import { ReportActions } from '../actions/ReportActions';
import { DocumentProcessingType } from '../constants/Constants';
import { Dict } from '../i18n';

export function Router(bot: Telegraf<ContextMessageUpdate>) {
    bot.start(ctx => ctx.reply(Dict.welcome));

    bot.on('document', async ctx => {
        return ctx.reply(Dict.documentPrompt, {
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
                    return ctx.reply(Dict.errors.callbackActionNotFound);
            }
        } catch (err) {
            return ctx.reply(Dict.errors.callbackDataCorrupted);
        }
    });
}
