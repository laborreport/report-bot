import { i18n } from '../i18n';
import { DocumentProcessingType } from '../common/CommonConstants';
export interface IDocumentActionsButton {
    action: DocumentProcessingType;
}

export const DocumentActionsKeyboard = {
    workSheetButton: {
        text: i18n.documentType[DocumentProcessingType.WORKSHEET],
        callback_data: JSON.stringify({
            action: DocumentProcessingType.WORKSHEET,
        } as IDocumentActionsButton),
    },
    actButton: {
        text: i18n.documentType[DocumentProcessingType.ACT],
        callback_data: JSON.stringify({
            action: DocumentProcessingType.ACT,
        } as IDocumentActionsButton),
    },
};
