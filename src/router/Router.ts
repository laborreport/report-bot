import Telegraf, { Extra, Markup } from 'telegraf';
import { i18n } from '../i18n';
import { TBotContext, IUserModel } from '../common/CommonTypes';
import {
    CredentialsCreateSceneName,
    UserModelSchema,
} from '../Scenes/Credentials/CredentialsCreate';
import {
    DocumentActionsKeyboard,
    IDocumentActionsButton,
} from '../keyboards/DocumentActionsKeyboard';
import {
    IActFormatButton,
    ActExportTypesKeyboard,
} from '../keyboards/ActExportTypesKeyboard';
import { DocumentProcessingType } from '../common/CommonConstants';
import { ReportActions } from '../actions/ReportActions';
import { CredentialsUseSceneName } from '../Scenes/Credentials/CredentialsUse';
import {
    ActNumberSceneName,
    ActNumberSceneValidator,
} from '../Scenes/ActNumber/ActNumber';

const start = (ctx: TBotContext) =>
    ctx.reply(
        i18n.welcome,
        Extra.HTML().markup(
            Markup.keyboard([
                Markup.button('Изменить настройки'),
                // Markup.button('Загрузить настройки из сообщения'),
                Markup.button('Показать настройки'),
                Markup.button('Изменить номер акта'),
            ])
        )
    );
export function Router(bot: Telegraf<TBotContext>) {
    bot.start(start);

    // bot.command('/example', ctx => ctx.scene.enter(exampleSceneName));
    bot.hears('Изменить настройки', ctx =>
        ctx.scene.enter(CredentialsCreateSceneName)
    );
    bot.hears('Загрузить настройки из сообщения', ctx =>
        ctx.scene.enter(CredentialsUseSceneName)
    );
    bot.hears('Изменить номер акта', ctx =>
        ctx.scene.enter(ActNumberSceneName)
    );
    bot.hears('Показать настройки', async ctx => {
        const { userModel = {}, act_number } = ctx.session;
        const credentials: Partial<IUserModel> & { act_number?: number } = {
            ...userModel,
            ...(act_number ? { act_number } : {}),
        };
        if (!Object.keys(credentials).length)
            return ctx.reply('Настройки пусты.');

        try {
            return ctx.reply(
                Object.keys(credentials)
                    .filter(key => Boolean(credentials[key]))
                    .map(key => [key, credentials[key]].join('-'))
                    .join('\n'),
                Extra.HTML().markup(
                    Markup.inlineKeyboard([
                        Markup.callbackButton(
                            'Выставить эти настройки',
                            'usecredentials'
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
        if (ctx.callbackQuery.data === 'usecredentials') {
            const { act_number, ...userModel } = ctx.callbackQuery.message.text
                .split('\n')
                .map(row => row.split('-'))
                .reduce<Partial<IUserModel> & { act_number?: number }>(
                    (acc, [key, value]) => {
                        return { ...acc, [key]: value };
                    },
                    {}
                );

            ctx.session = {
                ...ctx.session,
                userModel,
                act_number: act_number,
            };
            return ctx.reply('applied');
        }
        return next();
    });

    bot.on('callback_query', async (ctx: TBotContext, next: () => void) => {
        try {
            const { action }: IDocumentActionsButton = JSON.parse(
                ctx.callbackQuery.data
            );
            const documentFileId =
                ctx.callbackQuery.message.reply_to_message.document.file_id;
            if (!action) return next();
            switch (action) {
                case DocumentProcessingType.WORKSHEET:
                    return ReportActions.sendProcessedDocumentReport(
                        ctx,
                        documentFileId
                    );
                case DocumentProcessingType.ACT:
                    const { userModel, act_number } = ctx.session;
                    const userModelValid = await UserModelSchema.validate(
                        userModel
                    );

                    const act_numberValid = await ActNumberSceneValidator.validate(
                        act_number
                    );

                    if (!userModelValid || !act_numberValid)
                        return ctx.reply(
                            `Нет данных для формирования отчета.\n`
                        );
                    return ctx.reply('Формат?', {
                        reply_to_message_id:
                            ctx.callbackQuery.message.reply_to_message
                                .message_id,
                        reply_markup: {
                            inline_keyboard: [ActExportTypesKeyboard],
                        },
                    });

                default:
                    return ctx.reply(i18n.errors.callbackActionNotFound);
            }
        } catch (err) {
            console.error(err);
            return ctx.reply(i18n.errors.callbackDataCorrupted);
        }
    });

    bot.on('callback_query', (ctx: TBotContext) => {
        const { format }: IActFormatButton = JSON.parse(ctx.callbackQuery.data);
        const documentFileId =
            ctx.callbackQuery.message.reply_to_message.document.file_id;
        return ReportActions.sendActDocument(ctx, {
            act_number: ctx.session.act_number,
            user: ctx.session.userModel,
            docFormat: format,
            documentFileId,
        });
    });
    bot.on('message', start);
}
