import { TBotContext } from '../Setup/SetupTypes';

interface ISceneActionOptions {
    /** identifier of Scene action */
    question: string;
    questionHandler?: (ctx: TBotContext) => void;
    validator: (answer: string) => boolean;

    errorText: string;
}
export class SceneAction {
    public question: string;

    private validator: (answer: string) => boolean;
    private errorText: string;

    constructor(options: ISceneActionOptions) {
        this.question = options.question;
        this.validator = options.validator;
        this.errorText = options.errorText;
    }

    public perform(ctx: TBotContext) {
        return ctx.reply(this.question);
    }
    public check({ message: { text } }: TBotContext) {
        return this.validator(text);
    }
    public sendValidationError(ctx: TBotContext) {
        return ctx.reply(this.errorText);
    }
}
