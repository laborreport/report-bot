import Telegraf from 'telegraf';
import {
    DocumentActionsKeyboard,
    IDocumentActionsButton as IDocumentActionsButtonData,
} from '../keyboards/DocumentActionsKeyboard';
import { ReportActions } from '../actions/ReportActions';
import { i18n } from '../i18n';
import { TBotContext } from '../Setup/SetupTypes';
import { DocumentProcessingType } from '../common/CommonConstants';

export function Router(bot: Telegraf<TBotContext>) {
    bot.start(ctx => ctx.reply(i18n.welcome));

    bot.hears('session write', ctx => {
        ctx.session = { some: 'shit' };
        ctx.reply('written');
    });
    bot.hears('session read', ctx => {
        ctx.reply(JSON.stringify(ctx.session));
    });
    bot.hears('session clear', ctx => {
        ctx.session = {};

        ctx.reply('ok');
    });

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
