const CredentialsUseSceneName = 'CredentialsUseSceneName';
import { ValidatorBlockedSceneFactory } from '../ValidatorBlockedSceneFactory/ValidatorBlockedSceneFactory';
import { UserModelSchema, DateFormat } from './CredentialsCreate';
import { IUserModel } from '../../common/CommonTypes';
import Moment from 'moment';

const CredentialsUseScene = ValidatorBlockedSceneFactory(
    CredentialsUseSceneName,
    UserModelSchema,
    ({ contract_date, ...rest }: Partial<IUserModel>) => ctx => {
        ctx.session.userModel = {
            ...rest,
            contract_date: Moment(contract_date).format(DateFormat),
        };
        ctx.reply(JSON.stringify(ctx.session.userModel));
    },
    ['/cancel', ctx => ctx.scene.leave()],
    ctx => ctx.reply('Отправьте данные для формирования отчета')
);

export { CredentialsUseScene, CredentialsUseSceneName };
