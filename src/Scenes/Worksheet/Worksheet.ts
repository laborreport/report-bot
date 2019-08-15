import { Scene } from '../../Scene/Scene';
import { i18n } from '../../i18n';
import {
    DocumentActionsKeyboard,
    IDocumentActionsButton,
} from '../../keyboards/DocumentActionsKeyboard';
import { DocumentProcessingType } from '../../common/CommonConstants';
import {
    ActExportTypesKeyboard,
    IActFormatButton,
} from '../../keyboards/ActExportTypesKeyboard';
import { ReportActions } from '../../actions/ReportActions';
import { Extra } from 'telegraf';

const workSheetSceneName = 'worksheet';
const workSheetScene = new Scene(workSheetSceneName);

workSheetScene.enter(async ctx => {
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

workSheetScene.composer.on('callback_query', ctx => {
    try {
        const {
            action,
            format,
        }: IDocumentActionsButton & IActFormatButton = JSON.parse(
            ctx.callbackQuery.data
        );
        const documentFileId =
            ctx.callbackQuery.message.reply_to_message.document.file_id;
        if (format) {
            return ReportActions.sendActDocument(ctx, {
                documentFileId,
                user: ctx.session.userModel,
                // TODO: ask act_number
                act_number: 1,
                docFormat: format,
            });
        }

        switch (action) {
            case DocumentProcessingType.WORKSHEET:
                return ReportActions.sendProcessedDocumentReport(
                    ctx,
                    documentFileId
                );
            case DocumentProcessingType.ACT:
                ctx.editMessageReplyMarkup({
                    inline_keyboard: [
                        [
                            DocumentActionsKeyboard.workSheetButton,
                            DocumentActionsKeyboard.actButton,
                            ...ActExportTypesKeyboard,
                        ],
                    ],
                });
            default:
                return ctx.reply(i18n.errors.callbackActionNotFound);
        }
    } catch (err) {
        return ctx.reply(i18n.errors.callbackDataCorrupted);
    }
});

export { workSheetScene, workSheetSceneName };
