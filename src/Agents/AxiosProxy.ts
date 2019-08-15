import Axios from 'axios';
import { proxyAgent } from './ProxyAgent';
export const AxiosProxy = Axios.create({
    httpAgent: proxyAgent,
    httpsAgent: proxyAgent,
});
export const AxiosRegular = Axios.create();
