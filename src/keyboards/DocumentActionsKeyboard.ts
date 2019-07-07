import { DocumentProcessingType } from '../constants/Constants';
export interface IDocumentActionsButton {
    action: DocumentProcessingType;
}

export const DocumentActionsKeyboard = {
    inline_keyboard: [
        [
            {
                text: DocumentProcessingType.WORKSHEET,
                callback_data: JSON.stringify({
                    action: DocumentProcessingType.WORKSHEET,
                }),
            },
        ],
    ],
};
