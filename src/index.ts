import dotenv from 'dotenv';
import { SocksClient, SocksClientOptions } from 'socks';
import { setupBot } from './setupBot';

dotenv.config();

const socksClientOptions: SocksClientOptions = {
    proxy: {
        host: process.env.PROXY_HOST,
        port: Number(process.env.PROXY_PORT),
        type: 5,
        userId: process.env.PROXY_LOGIN,
        password: process.env.PROXY_PSSWD,
    },

    command: 'connect',

    destination: {
        host: 'api.telegram.org',
        port: 80,
    },
};
(async () => {
    try {
        console.log(socksClientOptions);
        const info = await SocksClient.createConnection(socksClientOptions);
        setupBot(info);
    } catch (error) {
        throw new Error(error);
    }
})();
