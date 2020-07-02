import Axios from 'axios';
import { BotAgent } from './ProxyAgent';
export const AxiosProxy = Axios.create({
    httpAgent: BotAgent,
    httpsAgent: BotAgent,
});
export const AxiosRegular = Axios.create();
