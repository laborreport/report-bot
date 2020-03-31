import Telegraf, { Extra, Markup, Middleware } from 'telegraf';
import { i18n } from '../i18n';
import { TBotContext, ISettings } from '../common/CommonTypes';
import {
    SettingsSceneSetName,
    SettingsSchema,
} from '../Scenes/Settings/SettingsSceneSet';
import { DocumentActionsKeyboard } from '../keyboards/DocumentActionsKeyboard';
import { DocumentProcessingType, EDocFormat, AllowedDocumentExtension } from '../common/CommonConstants';
import { ReportActions } from '../actions/ReportActions';
import { ActNumberSceneName } from '../Scenes/ActNumber/ActNumber';
import { FormatKeyboard } from '../keyboards/FormatKeyboard';
import { helpers } from '../helpers/helpers';

export function Main(bot: Telegraf<TBotContext>) {
    bot.start(helpers.messages.start);
    bot.help(helpers.messages.start);

    bot.hears(i18n.mainKeyboard.changeSettings, ctx =>
        ctx.scene.enter(SettingsSceneSetName)
    );
    bot.hears(i18n.mainKeyboard.ChangeActNumber, ctx =>
        ctx.scene.enter(ActNumberSceneName)
    );
    bot.hears(i18n.mainKeyboard.showSettings, ctx => helpers.showSettings(ctx));

    bot.on('document', async ctx => {
        /** extension checking */
        if (!ctx.message.document.file_name.endsWith(AllowedDocumentExtension))
            return helpers.messages.invalidDocumentExtension(ctx);
        return ctx.reply(i18n.documentPrompt, {
            reply_markup: {
                inline_keyboard: [
                    [
                        DocumentActionsKeyboard.workSheetButton,
                        DocumentActionsKeyboard.actButton,
                    ],
                ],
            },
            reply_to_message_id: ctx.message.message_id,
        });
    });

    bot.on(
        'callback_query',
        async (ctx: TBotContext, next: Middleware<TBotContext>) => {
            if (ctx.callbackQuery.data !== DocumentProcessingType.WORKSHEET) return next(ctx);
            try {
                const documentFileId =
                    ctx.callbackQuery.message.reply_to_message.document
                        .file_id;

                /** TODO: remove. Unused due to document first handling */
                const filename = ctx.callbackQuery.message.reply_to_message.document.file_name;
                if (!filename.endsWith(AllowedDocumentExtension))
                    return helpers.messages.invalidDocumentExtension(ctx);

                return ReportActions.sendProcessedDocumentReport(
                    ctx,
                    documentFileId
                );
            } catch (err) {
                console.error(err);
                helpers.messages.Error(ctx);
            }

        }
    );

    bot.on('callback_query', async (ctx, next: Middleware<TBotContext>) => {
        if (ctx.callbackQuery.data !== DocumentProcessingType.ACT) return next(ctx);
        try {
            await SettingsSchema.validate(
                ctx.state.session.settings
            );
            return ctx.reply(
                i18n.actFormat,
                Extra.HTML()
                    .inReplyTo(
                        ctx.callbackQuery.message.reply_to_message
                            .message_id
                    )
                    .markup(FormatKeyboard)
            );
        } catch (err) {
            console.error(err);
            return helpers.messages.invalidSettings(ctx);
        }

    });

    bot.on(
        'callback_query',
        (ctx: TBotContext, next: Middleware<TBotContext>) => {
            const format: EDocFormat = ctx.callbackQuery.data as EDocFormat;

            if (!Object.values(EDocFormat).includes(format)) return next(ctx);
            const documentFileId =
                ctx.callbackQuery.message.reply_to_message.document.file_id;
            /** TODO: remove. Unused due to document first handling */
            const filename = ctx.callbackQuery.message.reply_to_message.document.file_name;
            if (!filename.endsWith(AllowedDocumentExtension))
                return helpers.messages.invalidDocumentExtension(ctx);

            const { settings = {} } = ctx.state.session;
            const { error } = SettingsSchema.validate(settings);

            if (error)
                return helpers.messages.notEnoughSettings(ctx);

            const { act_number, ...userModel }: Partial<ISettings> = settings;

            return ReportActions.sendActDocument(ctx, {
                act_number: act_number,
                user: userModel,
                docFormat: format,
                documentFileId,
            });
        }
    );
    bot.on('callback_query', helpers.applySettings);

    bot.on('callback_query', helpers.messages.Error);

    bot.on('message', helpers.messages.start);
}
