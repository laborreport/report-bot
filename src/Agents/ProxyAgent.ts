import ProxyAgent from 'proxy-agent';
import { Agent } from 'https';
import dotenv from 'dotenv';
dotenv.config();
export const proxyAgent = (new ProxyAgent(
    `${process.env.PROXY_PROTOCOL}://${process.env.PROXY_LOGIN}:${
        process.env.PROXY_PSSWD
    }@${process.env.PROXY_HOST}:${process.env.PROXY_PORT}`
) as unknown) as Agent;
