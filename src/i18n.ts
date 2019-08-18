import {
    DocumentProcessingType,
    EUserModelKeys,
    DateFormat,
} from './common/CommonConstants';
import { IUserModel, ISettings } from './common/CommonTypes';

export const settingsFormatter = (credentials: Partial<ISettings>) => {
    return Object.keys(credentials)
        .filter(key => Boolean(credentials[key]))
        .map(key => [i18n.credentials[key], key, credentials[key]].join(' -- '))
        .join('\n');
};

export const settingsParser = (text: string) => {
    return text
        .split('\n')
        .map(row => row.split(' -- '))
        .reduce<Partial<ISettings>>((acc, [, key, value]) => {
            return { ...acc, [key]: value };
        }, {});
};
export const i18n = {
    mainKeyboard: {
        changeSettings: 'Изменить настройки',
        showSettings: 'Показать настройки',
        ChangeActNumber: 'Изменить номер акта',
    },

    callbackButtons: {
        setSettings: {
            text: 'Выставить эти настройки',
            callbackData: 'usercredentials',
        },
    },
    settings: {
        empty: 'Настройки пусты.',
        applied: 'Настройки применены',
        notEnough: 'Не хватает настроек',
    },
    credentials: {
        [EUserModelKeys.contract_number]: 'Номер договора с ООО «ПИРС»:',
        [EUserModelKeys.contract_date]: `Дата заключения договора с ООО «ПИРС»:`,
        [EUserModelKeys.pe_series]: 'Серия Свидетельства о регистрации ИП:',
        [EUserModelKeys.pe_number]: 'Номер Свидетельства о регистрации ИП:',
        [EUserModelKeys.rate]: 'Размер ставки',

        act_number: 'Номер акта',
    },

    credentialsEnterMessage: {
        [EUserModelKeys.contract_number]:
            'Введите номер Договора с ООО «ПИРС»:',
        [EUserModelKeys.contract_date]: `Введите дату заключения Договора с ООО «ПИРС» (в формате ${DateFormat}) :`,
        [EUserModelKeys.pe_series]:
            'Введите серию Свидетельства о регистрации ИП:',
        [EUserModelKeys.pe_number]:
            'Введите номер Свидетельства о регистрации ИП:',
        [EUserModelKeys.rate]: 'Введите размер вашей ставки:',
    },
    actNumber: {
        enterActNumber: 'Введите номер акта',
        actNumberChanged: 'Номер акта применен',
    },
    act: 'Акт',
    welcome:
        'Привет! Пришли мне выгрузку из Jira, я создам тебе отчет трудозатрат.',
    documentPrompt: 'Что сделать с файлом?',
    actFormat: 'Формат акта',
    documentType: {
        [DocumentProcessingType.WORKSHEET]: 'Трудозатраты',
        [DocumentProcessingType.ACT]: 'Акт выполненных работ',
    },
    errors: {
        reportService: 'Поймал ошибку при обработке документа 😔 ',
        callbackActionNotFound: 'Не могу обработать эту кнопку 😔',
        callbackDataCorrupted:
            'Не могу обработать эту кнопку. Данные устарели 😔',
    },
};
