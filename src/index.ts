import dotenv from 'dotenv';
import { setupBot } from './setupBot';
import proxyAgent from 'proxy-agent';

dotenv.config();

setupBot(
    new proxyAgent(
        `${process.env.PROXY_PROTOCOL}://${process.env.PROXY_LOGIN}:${
            process.env.PROXY_PSSWD
        }@${process.env.PROXY_HOST}:${process.env.PROXY_PORT}`
    )
);
