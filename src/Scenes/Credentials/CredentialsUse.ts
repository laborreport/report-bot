const CredentialsUseSceneName = 'CredentialsUseSceneName';
import { ValidatorBlockedSceneFactory } from '../ValidatorBlockedSceneFactory/ValidatorBlockedSceneFactory';
import { UserModelSchema, DateFormat } from './CredentialsCreate';
import { IUserModel } from '../../common/CommonTypes';
import Moment from 'moment';

const CredentialsUseScene = ValidatorBlockedSceneFactory(
    CredentialsUseSceneName,
    UserModelSchema,
    ({ contractDate, ...rest }: Partial<IUserModel>) => ctx => {
        ctx.session.userModel = {
            ...rest,
            contractDate: Moment(contractDate).format(DateFormat),
        };
        ctx.reply(JSON.stringify(ctx.session.userModel));
    },
    ['/cancel', ctx => ctx.scene.leave()],
    ctx => ctx.reply('Отправьте данные для формирования отчета')
);

export { CredentialsUseScene, CredentialsUseSceneName };
