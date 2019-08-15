import { AxiosRegular } from '../Agents/AxiosProxy';
import { AxiosResponse } from 'axios';
import FormData from 'form-data';
import { IUserModel } from '../common/CommonTypes';
import { EDocFormat } from '../common/CommonConstants';

interface ISendReportBody {
    user: Partial<IUserModel>;
    act_number: number;
}
interface ISendReportOptions<T> {
    url: string;
    worksheet: ArrayBuffer;
    body?: T;
}

const sendReport = async ({
    url,
    worksheet,
    body,
}: ISendReportOptions<ISendReportBody>) => {
    const formData = new FormData();
    formData.append('file', worksheet, { filename: 'report.xlsx' });
    try {
        const response: AxiosResponse<Buffer> = await AxiosRegular.post(
            url,
            body ? { file: formData, ...body } : formData,
            {
                responseType: 'arraybuffer',
                headers: formData.getHeaders(),
            }
        );
        if (response.status !== 200) throw new Error(response.statusText);
        return {
            buffer: response.data,
            filename: decodeURI(
                response.headers['content-disposition'].split(`filename=`)[1]
            ),
        };
    } catch (err) {
        console.error(err);
        throw err;
    }
};
export class ReportService {
    static async getReportByWorksheet(worksheet: ArrayBuffer) {
        return sendReport({
            url: `${process.env.REPORT_REST_SERVICE}/labor-report`,
            worksheet,
        });
    }

    static async getActByWorksheet(
        worksheet: ArrayBuffer,
        docFormat: EDocFormat = EDocFormat.PDF,
        user: Partial<IUserModel>,
        act_number: number
    ) {
        return sendReport({
            url: `${process.env.REPORT_REST_SERVICE}/act-report/${docFormat}`,
            worksheet,
            body: {
                user,
                act_number,
            },
        });
    }
}
