import { Scene } from '../../Scene/Scene';
import { TBotContext } from '../../common/CommonTypes';

import * as JoiBase from '@hapi/joi';
import JoiDate from '@hapi/joi-date';
import { ValidatorBlockedSceneFactory } from '../ValidatorBlockedSceneFactory/ValidatorBlockedSceneFactory';

const Joi: JoiBase.Root = JoiBase.extend(JoiDate);

type TValidator = <T>(
    value: T,
    options?: JoiBase.ValidationOptions
) => JoiBase.ValidationResult<T>;

export const DateFormat = 'DD.MM.YYYY';

enum EUserModelKeys {
    contractNumber = 'contractNumber',
    contractDate = 'contractDate',
    peSeries = 'peSeries',
    peNumber = 'peNumber',
    rate = 'rate',
}

const SceneMessagesMap = {
    [EUserModelKeys.contractNumber]: 'Введите номер договора',
    [EUserModelKeys.contractDate]: 'Введите дату заключения договора',
    [EUserModelKeys.peSeries]: 'Серия ИП',
    [EUserModelKeys.peNumber]: 'Номер ИП',
    [EUserModelKeys.rate]: 'Ставка',
};

const schema = JoiBase.object().keys({
    [EUserModelKeys.contractNumber]: Joi.number()
        .min(1)
        .max(99),
    [EUserModelKeys.contractDate]: Joi.date().format(DateFormat),
    [EUserModelKeys.peSeries]: Joi.string().length(2),
    [EUserModelKeys.peNumber]: Joi.string().length(9),
    [EUserModelKeys.rate]: Joi.number()
        .min(0)
        .max(2000),
});

const submitMiddleware = (ctx: TBotContext) =>
    ctx.reply(JSON.stringify(ctx.session.userModel));

const CredentialScenes: Scene[] = Object.entries(SceneMessagesMap).map(
    ([name, message], index) => {
        const scene = ValidatorBlockedSceneFactory(
            name,
            message,
            Joi.reach(schema, [name]),
            (result: string) => {
                return ctx => {
                    ctx.session.userModel = {
                        ...ctx.session.userModel,
                        [name]: result,
                    };

                    const nextScene = Object.keys(SceneMessagesMap)[index + 1];
                    ctx.session.userModel[name] && ctx.scene.enter(nextScene);

                    !nextScene && submitMiddleware(ctx);
                };
            }
        );

        scene.composer.command('/cancel', ctx => ctx.scene.leave());

        return scene;
    }
);

const CredentialsSceneName = EUserModelKeys.contractNumber;
export { CredentialScenes, CredentialsSceneName };
