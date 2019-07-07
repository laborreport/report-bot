import { AxiosRegular } from '../utils/AxiosProxy';
import { AxiosResponse } from 'axios';
import FormData from 'form-data';
export class ReportService {
    static async getReport(file: ArrayBuffer) {
        const formData = new FormData();
        formData.append('file', file, { filename: 'report.xlsx' });
        try {
            const response: AxiosResponse<Buffer> = await AxiosRegular.post(
                `${process.env.REPORT_REST_SERVICE}/labor-report`,
                formData,
                {
                    responseType: 'arraybuffer',
                    headers: formData.getHeaders(),
                }
            );
            if (response.status !== 200) throw new Error(response.statusText);
            return {
                buffer: response.data,
                filename: decodeURI(
                    response.headers['content-disposition'].split(
                        `filename=`
                    )[1]
                ),
            };
        } catch (err) {
            throw err;
        }
    }
}