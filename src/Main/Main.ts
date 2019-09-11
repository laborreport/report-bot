import Telegraf, { Extra, Markup, Middleware } from 'telegraf';
import { i18n } from '../i18n';
import { TBotContext, ISettings } from '../common/CommonTypes';
import {
    SettingsSceneSetName,
    SettingsSchema,
} from '../Scenes/Settings/SettingsSceneSet';
import { DocumentActionsKeyboard } from '../keyboards/DocumentActionsKeyboard';
import { DocumentProcessingType, EDocFormat } from '../common/CommonConstants';
import { ReportActions } from '../actions/ReportActions';
import { ActNumberSceneName } from '../Scenes/ActNumber/ActNumber';
import { FormatKeyboard } from '../keyboards/FormatKeyboard';
import { helpers } from '../helpers/helpers';
import * as JoiBase from '@hapi/joi';

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
            if (ctx.callbackQuery.data === DocumentProcessingType.WORKSHEET) {
                try {
                    const documentFileId =
                        ctx.callbackQuery.message.reply_to_message.document
                            .file_id;
                    return ReportActions.sendProcessedDocumentReport(
                        ctx,
                        documentFileId
                    );
                } catch (err) {
                    console.error(err);
                    helpers.messages.Error(ctx);
                }
            } else {
                next(ctx);
            }
        }
    );

    bot.on('callback_query', async (ctx, next: Middleware<TBotContext>) => {
        if (ctx.callbackQuery.data === DocumentProcessingType.ACT) {
            try {
                const settings = await SettingsSchema.validate(
                    ctx.session.settings
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
                // TODO: new helper

                helpers.messages.Error(ctx);
            }
        } else {
            next(ctx);
        }
    });

    bot.on(
        'callback_query',
        (ctx: TBotContext, next: Middleware<TBotContext>) => {
            const format: EDocFormat = ctx.callbackQuery.data as EDocFormat;

            if (!Object.values(EDocFormat).includes(format)) return next(ctx);
            const documentFileId =
                ctx.callbackQuery.message.reply_to_message.document.file_id;

            const { settings = {} } = ctx.session;
            const { error } = SettingsSchema.validate(settings);

            if (error)
                return ctx.reply(
                    `${i18n.settingsState.notEnough}\n${JSON.stringify(
                        error.details.map(({ message }) => message).join('\n')
                    )}`
                );

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
