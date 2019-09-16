import { AxiosProxy } from '../Agents/AxiosProxy';
import { AxiosResponse } from 'axios';

export class TelegramFileService {
    static async downloadFile(fileLink: string) {
        try {
            const response: AxiosResponse<ArrayBuffer> = await AxiosProxy.get(
                fileLink,
                {
                    responseType: 'arraybuffer',
                }
            );

            return response.data;
        } catch (err) {
            throw new Error(err);
        }
    }
}
