import { Context, Middleware, ContextMessageUpdate } from 'telegraf';

export interface IFlow {
    state: IWizardContextState;
    wizard: WizardContext;
    leave: () => void;
    enter: () => void;
}

type TStep = Middleware<IWizardContext>;

export interface IWizardContext extends ContextMessageUpdate {
    flow: IFlow;
}

export interface IWizardContextState {
    _pos: number;
}

class WizardContext {
    ctx: Context;
    steps: TStep[];
    state: {
        _pos: number;
    };
    constructor(ctx: IWizardContext, steps: TStep[]) {
        this.ctx = ctx;
        this.steps = steps;
        this.state = ctx.flow.state;
        this.state._pos = this.state._pos || 0;
    }

    getStep() {
        return this.steps[this.state._pos];
    }

    selectStep(index: number) {
        this.state._pos = index;
        return this;
    }

    next() {
        return this.selectStep(this.state._pos + 1);
    }

    back() {
        return this.selectStep(this.state._pos - 1);
    }
}

export class WizardScene {
    id: string;
    steps: TStep[];
    constructor(id: string, ...steps: TStep[]) {
        this.id = id;
        this.steps = steps;
    }

    middleware() {
        return (ctx: IWizardContext, next: TStep) => {
            const wizard = new WizardContext(ctx, this.steps);
            ctx.flow.wizard = wizard;
            if (!wizard.getStep()) {
                wizard.selectStep(0);
                return ctx.flow.leave();
            }
            return wizard.getStep()(ctx, next as () => any);
        };
    }
}
