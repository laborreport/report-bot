export enum DocumentProcessingType {
    WORKSHEET = 'worksheet',
    WORKACT = 'workact',
}

export interface IUserModel {
    contractNumber: string;

    contractDate: string;

    peSeries: string;

    peNumber: string;

    rate: number;
}
