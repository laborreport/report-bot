import ProxyAgent from 'proxy-agent';
import { Agent } from 'https';
import dotenv from 'dotenv';
import * as JoiBase from '@hapi/joi';
const env = dotenv.config();

const validationResult = JoiBase.validate(env.parsed, {
    PROXY_PROTOCOL: JoiBase.string().required(),
    PROXY_LOGIN: JoiBase.string().required(),
    PROXY_PSSWD: JoiBase.string().required(),
    PROXY_HOST: JoiBase.string().required(),
    PROXY_PORT: JoiBase.string().required(),
}, {allowUnknown: true});

const isConfigHasNOProxy = !!validationResult.error;

isConfigHasNOProxy && console.warn('For Proxy to Work satisfy:', validationResult.error.annotate());

isConfigHasNOProxy ? console.log(' RUNNING DEFAULT AGENT'): console.log(' RUNNING PROXY AGENT')

export const BotAgent = isConfigHasNOProxy ? new Agent(): (new ProxyAgent(
    `${process.env.PROXY_PROTOCOL}://${process.env.PROXY_LOGIN}:${
        process.env.PROXY_PSSWD
    }@${process.env.PROXY_HOST}:${process.env.PROXY_PORT}`
) as unknown) as Agent;
