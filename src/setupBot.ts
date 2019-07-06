import Telegraf from 'telegraf';
import { Agent } from 'https';
export function setupBot(agent: Agent) {
    const bot = new Telegraf(process.env.BOT_TOKEN, {
        telegram: { agent: agent },
    });
    bot.start(ctx => ctx.reply('Welcome!'));
    bot.help(ctx => ctx.reply('Send me a sticker'));
    bot.on('sticker', ctx => ctx.reply('👍'));
    bot.hears('hi', ctx => ctx.reply('Hey there'));
    bot.launch();
}
