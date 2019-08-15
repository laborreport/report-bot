import Telegraf from 'telegraf';
import {
    DocumentActionsKeyboard,
    IDocumentActionsButton as IDocumentActionsButtonData,
} from '../keyboards/DocumentActionsKeyboard';
import { ReportActions } from '../actions/ReportActions';
import { i18n } from '../i18n';
import { DocumentProcessingType } from '../common/CommonConstants';
import { TBotContext } from '../common/CommonTypes';
import { exampleSceneName } from '../Scenes/Example/Example';
import { CredentialsSceneName } from '../Scenes/Credentials/Credentials';

export function Router(bot: Telegraf<TBotContext>) {
    bot.start(ctx => ctx.reply(i18n.welcome));

    bot.command('/example', ctx => ctx.scene.enter(exampleSceneName));
    bot.command('/credentials', ctx => ctx.scene.enter(CredentialsSceneName));

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
