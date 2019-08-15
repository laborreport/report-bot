import { EDocFormat } from '../common/CommonConstants';
import { format } from 'util';
import { i18n } from '../i18n';

export interface IActFormatButton {
    format: EDocFormat;
}
export const ActExportTypesKeyboard = Object.values(EDocFormat).map(
    (format: string) => ({
        text: `${i18n.act} ${format}`,
        callback_data: JSON.stringify({
            format,
        } as IActFormatButton),
    })
);
