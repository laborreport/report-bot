import Telegraf from 'telegraf';
import { Agent } from 'https';
import axios from 'axios';

export function setupBot(agent: Agent) {
    const bot = new Telegraf(process.env.BOT_TOKEN, {
        telegram: { agent: agent },
    });
    bot.start(ctx => ctx.reply('Welcome! send me a jira worksheet file.'));
    bot.on('document', async ctx => {
        const { file } = await axios.post(
            `${process.env.REPORT_REST_SERVICE}/api/report`,
            {
                data: ctx.message.document,
            }
        );
        return ctx.telegram.sendDocument(ctx.from.id, file);
    });
    bot.launch();
}
