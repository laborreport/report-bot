import Telegraf, { Extra, Markup, Middleware } from 'telegraf';
import { i18n, settingsFormatter, settingsParser } from '../i18n';
import { TBotContext, ISettings } from '../common/CommonTypes';
import {
    CredentialsCreateSceneName,
    UserModelSchema,
} from '../Scenes/Credentials/CredentialsCreate';
import {
    DocumentActionsKeyboard,
    IDocumentActionsButton,
} from '../keyboards/DocumentActionsKeyboard';
import { DocumentProcessingType, EDocFormat } from '../common/CommonConstants';
import { ReportActions } from '../actions/ReportActions';
import {
    ActNumberSceneName,
    ActNumberSceneValidator,
} from '../Scenes/ActNumber/ActNumber';
import { FormatKeyboard } from '../keyboards/FormatKeyboard';

const start = (ctx: TBotContext) =>
    ctx.reply(
        i18n.welcome,
        Extra.HTML().markup(
            Markup.keyboard([
                Markup.button(i18n.mainKeyboard.changeSettings),
                Markup.button(i18n.mainKeyboard.showSettings),
                Markup.button(i18n.mainKeyboard.ChangeActNumber),
            ])
        )
    );
export function Main(bot: Telegraf<TBotContext>) {
    bot.start(start);

    bot.hears(i18n.mainKeyboard.changeSettings, ctx =>
        ctx.scene.enter(CredentialsCreateSceneName)
    );
    bot.hears(i18n.mainKeyboard.ChangeActNumber, ctx =>
        ctx.scene.enter(ActNumberSceneName)
    );
    bot.hears(i18n.mainKeyboard.showSettings, async ctx => {
        const { userModel = {}, act_number } = ctx.session;
        const credentials: Partial<ISettings> = {
            ...userModel,
            ...(act_number ? { act_number } : {}),
        };
        if (!Object.keys(credentials).length)
            return ctx.reply('Настройки пусты.');

        try {
            return ctx.reply(
                settingsFormatter(credentials),
                Extra.HTML().markup(
                    Markup.inlineKeyboard([
                        Markup.callbackButton(
                            i18n.callbackButtons.setSettings.text,
                            i18n.callbackButtons.setSettings.callbackData
                        ),
                    ])
                )
            );
        } catch (err) {
            return console.error(err);
        }
    });

    bot.on('document', async ctx => {
        const userModel = await UserModelSchema.validate(ctx.session.userModel);
        return ctx.reply(i18n.documentPrompt, {
            reply_markup: {
                inline_keyboard: [
                    [
                        DocumentActionsKeyboard.workSheetButton,
                        ...(userModel
                            ? [DocumentActionsKeyboard.actButton]
                            : []),
                    ],
                ],
            },
            reply_to_message_id: ctx.message.message_id,
        });
    });

    bot.on('callback_query', (ctx, next) => {
        if (
            ctx.callbackQuery.data ===
            i18n.callbackButtons.setSettings.callbackData
        ) {
            const { act_number, ...userModel } = settingsParser(
                ctx.callbackQuery.message.text
            );

            ctx.session = {
                ...ctx.session,
                userModel,
                act_number,
            };
            return ctx.reply(i18n.settings.applied);
        }
        return next();
    });

    bot.on(
        'callback_query',
        async (ctx: TBotContext, next: Middleware<TBotContext>) => {
            const format: EDocFormat = ctx.callbackQuery.data as EDocFormat;

            if (!Object.values(EDocFormat).includes(format)) return next(ctx);
            const documentFileId =
                ctx.callbackQuery.message.reply_to_message.document.file_id;

            const { userModel, act_number } = ctx.session;
            const userModelValid = await UserModelSchema.validate(userModel);

            const act_numberValid = await ActNumberSceneValidator.validate(
                act_number
            );

            if (!userModelValid || !act_numberValid)
                return ctx.reply(i18n.settings.notEnough);
            return ReportActions.sendActDocument(ctx, {
                act_number: ctx.session.act_number,
                user: ctx.session.userModel,
                docFormat: format,
                documentFileId,
            });
        }
    );
    bot.on('callback_query', async (ctx: TBotContext, next: () => void) => {
        try {
            const { action }: IDocumentActionsButton = JSON.parse(
                ctx.callbackQuery.data
            );
            if (!action) return next();
            const documentFileId =
                ctx.callbackQuery.message.reply_to_message.document.file_id;
            switch (action) {
                case DocumentProcessingType.WORKSHEET:
                    return ReportActions.sendProcessedDocumentReport(
                        ctx,
                        documentFileId
                    );
                case DocumentProcessingType.ACT:
                    return ctx.reply(
                        i18n.actFormat,
                        Extra.HTML()
                            .inReplyTo(
                                ctx.callbackQuery.message.reply_to_message
                                    .message_id
                            )
                            .markup(FormatKeyboard)
                    );

                default:
                    return ctx.reply(i18n.errors.callbackActionNotFound);
            }
        } catch (err) {
            console.error(err);
            return ctx.reply(i18n.errors.callbackDataCorrupted);
        }
    });

    bot.on('message', start);
}
