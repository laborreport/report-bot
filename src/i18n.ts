import {
    DocumentProcessingType,
    ESettingsKeys,
    DateFormat,
} from './common/CommonConstants';
import { ISettings } from './common/CommonTypes';

const SETTINGS_SEPARATOR = '\n';
export const CANCEL_COMMAND = '/cancel';
export const settingsFormatter = (credentials: Partial<ISettings>) => {
    return Object.keys(credentials)
        .filter(key => Boolean(credentials[key]))
        .map(key =>
            [i18n.settings[key], key, credentials[key]].join(SETTINGS_SEPARATOR)
        )
        .join('\n\n');
};

export const settingsParser = (text: string) => {
    return text
        .split('\n\n')
        .map(row => row.split(SETTINGS_SEPARATOR))
        .reduce<Partial<ISettings>>((acc, [, key, value]) => {
            return { ...acc, [key]: value };
        }, {});
};
export const i18n = {
    mainKeyboard: {
        changeSettings: `⚙️ Изменить настройки`,
        showSettings: `🔎 Показать настройки`,
        ChangeActNumber: `✏️ Изменить номер акта`,
    },

    exit: `Выход`,

    callbackButtons: {
        setSettings: {
            text: `Применить эти настройки`,
            callbackData: `usercredentials`,
        },
    },
    settingsState: {
        empty: `Настройки пусты.\n\nЕсли вы вводили свои данные ранее, то вернитесь к этому сообщению в диалоге и нажмите под ним кнопку "Применить эти настройки".`,
        applied: `Настройки применены.`,
        notEnough: `Не хватает настроек. Заполните данные о себе через кнопку "Изменить настройки" в меню.`,
    },
    settings: {
        [ESettingsKeys.contract_number]: `Номер договора с ООО «ПИРС»`,
        [ESettingsKeys.contract_date]: `Дата заключения договора с ООО «ПИРС»`,
        [ESettingsKeys.pe_number]: `Номер Свидетельства или листа записи ЕГРИП`,
        [ESettingsKeys.pe_date]: `Дата регистрации ИП`,
        [ESettingsKeys.rate]: `Размер ставки`,
        [ESettingsKeys.act_number]: `Номер акта`,
    },

    settingsEnterMessage: {
        [ESettingsKeys.contract_number]: `Введите номер Договора с ООО «ПИРС». ${CANCEL_COMMAND} для отмены`,
        [ESettingsKeys.contract_date]: `🗓 Введите дату заключения Договора с ООО «ПИРС» (в формате ДД.ММ.ГГГГ). ${CANCEL_COMMAND} для отмены`,
        [ESettingsKeys.pe_date]: `Введите дату открытия ИП (в формате ДД.ММ.ГГГГ). ${CANCEL_COMMAND} для отмены`,
        [ESettingsKeys.pe_number]: `Номер Свидетельства (ИП до 2017 года) вида '12 123456789' или листа записи ЕГРИП(ИП после 2017 года) вида '123456789012345'. ${CANCEL_COMMAND} для отмены`,
        [ESettingsKeys.rate]: `Введите размер вашей ставки. ${CANCEL_COMMAND} для отмены`,
        [ESettingsKeys.act_number]: `Введите номер акта. В дальнейшем можно изменить этот параметр из меню. ${CANCEL_COMMAND} для отмены`,
    },
    actNumber: {
        actNumberChanged: `Номер акта применен.`,
    },
    welcome: `Привет! Пришли мне выгрузку из Jira и я создам отчет трудозатрат или акт выполненных работ.\n\nTempo -> My work, выставить период в месяц и справа нажать кнопку "...", там сделать выгрузку в xls и прислать мне в диалог.`,
    documentPrompt: `❔Что сделать с файлом?`,
    actFormat: `🖨 Выберите формат акта.\nНормальное отображение docx документа гарантируется только в Microsoft Word и OnlyOffice`,
    documentType: {
        [DocumentProcessingType.WORKSHEET]: `Трудозатраты`,
        [DocumentProcessingType.ACT]: `Акт выполненных работ`,
    },
    errors: {
        reportService: `😔 Поймал ошибку при обработке документа`,
        callbackActionNotFound: `😔 Не могу обработать эту кнопку`,
        commonError: `😔 Не могу обработать запрос`,
        invalidSettings: `⚙️ Нет нужных настроек. Заполните данные о себе через кнопку "Изменить настройки" в меню.`,
        invalidDocumentExtension: '😡 Ошибка. Неверный формат выгрузки. Нужен "*.XLS"',
    },
};
