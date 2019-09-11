import { TBotContext, ISettings } from '../common/CommonTypes';
import { i18n, settingsFormatter, settingsParser } from '../i18n';
import { Extra, Markup } from 'telegraf';

import * as JoiBase from '@hapi/joi';
import { SettingsSchema } from '../Scenes/Settings/SettingsSceneSet';
import { throwStatement } from '@babel/types';

export const processors = {
    gatherCredentials: (ctx: TBotContext, fromTemp = false) => {
        const { session: { tempSettings = {}, settings = {} } = {} } = ctx;
        if (!fromTemp) {
            return settings;
        } else {
            return tempSettings;
        }
    },
};
export const helpers = {
    messages: {
        start: (ctx: TBotContext) =>
            ctx.reply(
                i18n.welcome,
                Extra.HTML().markup(
                    Markup.keyboard([
                        Markup.button(i18n.mainKeyboard.changeSettings),
                        Markup.button(i18n.mainKeyboard.showSettings),
                        Markup.button(i18n.mainKeyboard.ChangeActNumber),
                    ])
                )
            ),
        exit: (ctx: TBotContext) => {
            return ctx.reply(i18n.exit);
        },
        Error: (ctx: TBotContext) => {
            return ctx.reply(i18n.errors.commonError);
        },
    },
    async showSettings(ctx: TBotContext, credentials?: Partial<ISettings>) {
        const creds = credentials || processors.gatherCredentials(ctx);
        if (!Object.keys(creds).length) return ctx.reply('Настройки пусты.');

        try {
            return ctx.reply(
                settingsFormatter(creds),
                Extra.HTML().markup(
                    Markup.inlineKeyboard([
                        Markup.callbackButton(
                            i18n.callbackButtons.setSettings.text,
                            i18n.callbackButtons.setSettings.callbackData
                        ),
                    ])
                )
            );
        } catch (err) {
            return console.error(err);
        }
    },
    async applySettings(ctx: TBotContext, next: () => void) {
        if (
            ctx.callbackQuery.data ===
            i18n.callbackButtons.setSettings.callbackData
        ) {
            const settings = settingsParser(ctx.callbackQuery.message.text);

            try {
                const { error } = JoiBase.validate(settings, SettingsSchema);
                if (error) throw error;

                ctx.session = {
                    ...ctx.session,
                    settings: settings,
                };
                return ctx.reply(i18n.settingsState.applied);
            } catch (err) {
                console.error(err);
                return helpers.messages.Error(ctx);
            }
        } else {
            next();
        }
    },
};
