import { DocumentProcessingType } from '../constants/Constants';
export interface IDocumentActionsButton {
    documentFileId: string;
    action: DocumentProcessingType;
}
export const DocumentActionsKeyboard = (documentFileId: string) => ({
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
});
