import Telegraf from 'telegraf';
import {
    DocumentActionsKeyboard,
    IDocumentActionsButton as IDocumentActionsButtonData,
} from '../keyboards/DocumentActionsKeyboard';
import { ReportActions } from '../actions/ReportActions';
import { i18n } from '../i18n';
import { TBotContext } from '../Setup/SetupTypes';
import { DocumentProcessingType } from '../common/CommonConstants';
import { CredentialsScene } from '../Scenes/Credentials/Credentials';

export function Router(bot: Telegraf<TBotContext>) {
    bot.start(ctx => ctx.reply(i18n.welcome));

    bot.command('/credentials', ctx => CredentialsScene.enter(ctx));
    bot.on('document', async ctx => {
        return ctx.reply(i18n.documentPrompt, {
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
                    return ctx.reply(i18n.errors.callbackActionNotFound);
            }
        } catch (err) {
            return ctx.reply(i18n.errors.callbackDataCorrupted);
        }
    });
}
