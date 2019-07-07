import { DocumentProcessingType } from '../constants/Constants';
import { Dict } from '../i18n';
export interface IDocumentActionsButton {
    action: DocumentProcessingType;
}

export const DocumentActionsKeyboard = {
    inline_keyboard: [
        [
            {
                text: Dict.documentType[DocumentProcessingType.WORKSHEET],
                callback_data: JSON.stringify({
                    action: DocumentProcessingType.WORKSHEET,
                }),
            },
        ],
    ],
};
