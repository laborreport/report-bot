import { EDocFormat } from '../common/CommonConstants';
import { Markup } from 'telegraf';

export const FormatKeyboard = Markup.inlineKeyboard([
    Object.values(EDocFormat).map(format =>
        Markup.callbackButton(format, format)
    ),
]);
