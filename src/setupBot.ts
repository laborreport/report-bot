import Telegraf from 'telegraf';
import { SocksClientEstablishedEvent } from 'socks/typings/common/constants';

export function setupBot(socksClient: SocksClientEstablishedEvent) {
    console.log(socksClient);
    const bot = new Telegraf(process.env.BOT_TOKEN, {
        // telegram: { agent: socksClient },
    });
    bot.start(ctx => ctx.reply('Welcome!'));
    bot.help(ctx => ctx.reply('Send me a sticker'));
    bot.on('sticker', ctx => ctx.reply('👍'));
    bot.hears('hi', ctx => ctx.reply('Hey there'));
    bot.launch();
}
