import { DocumentProcessingType } from './constants/Constants';

export const i18n = {
    welcome:
        'Привет! Пришли мне выгрузку из Jira, я создам тебе отчет трудозатрат.',
    documentPrompt: 'Что сделать с файлом?',
    documentType: {
        [DocumentProcessingType.WORKSHEET]: 'Трудозатраты',
        // TODO: use when report service is ready
        [DocumentProcessingType.WORKACT]: 'Акт выполненных работ',
    },
    errors: {
        reportService: 'Поймал ошибку при обработке документа 😔 ',
        callbackActionNotFound: 'Не могу обработать эту кнопку 😔',
        callbackDataCorrupted:
            'Не могу обработать эту кнопку. Данные устарели 😔',
    },
};
