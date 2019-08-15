import { AxiosRegular } from '../Agents/AxiosProxy';
import { AxiosResponse } from 'axios';
import FormData from 'form-data';
export class ReportService {
    static async getReportByWorksheet(worksheet: ArrayBuffer) {
        const formData = new FormData();
        formData.append('file', worksheet, { filename: 'report.xlsx' });
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
