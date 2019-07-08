import { DocumentProcessingType } from '../constants/Constants';
import { i18n } from '../i18n';
export interface IDocumentActionsButton {
    action: DocumentProcessingType;
}

export const DocumentActionsKeyboard = {
    inline_keyboard: [
        [
            {
                text: i18n.documentType[DocumentProcessingType.WORKSHEET],
                callback_data: JSON.stringify({
                    action: DocumentProcessingType.WORKSHEET,
                } as IDocumentActionsButton),
            },
        ],
    ],
};
