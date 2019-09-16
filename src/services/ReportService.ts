import { AxiosRegular } from '../Agents/AxiosProxy';
import { AxiosResponse } from 'axios';
import FormData from 'form-data';
import { IUserModel } from '../common/CommonTypes';
import { EDocFormat, DateFormat } from '../common/CommonConstants';
import Moment from 'moment';

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
    Object.keys(body || {}).forEach(key => {
        formData.append(
            key,
            typeof body[key] === 'object'
                ? JSON.stringify(body[key])
                : body[key]
        );
    });
    try {
        const response: AxiosResponse<Buffer> = await AxiosRegular.post(
            url,
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
        { contract_date, ...restUser }: Partial<IUserModel>,
        act_number: number
    ) {
        return sendReport({
            url: `${process.env.REPORT_REST_SERVICE}/act-report/${docFormat}`,
            worksheet,
            body: {
                user: {
                    ...restUser,
                    contract_date: Moment(contract_date, DateFormat).format(
                        'YYYY-MM-DD'
                    ),
                },
                act_number,
            },
        });
    }
}
