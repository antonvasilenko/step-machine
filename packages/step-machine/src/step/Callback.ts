import Step from './Step';
import { CallbackFunc, ExecutionContext, Element, VisitorFunc } from './types';

class Callback<StateObject> implements Element {
  constructor(
    public step: Step<StateObject>,
    public name: string,
    private callbackFn: CallbackFunc<StateObject>,
  ) {}

  invoke(
    stateObj: StateObject,
    payload: unknown,
    ctx: ExecutionContext<StateObject>,
  ): PromiseLike<StateObject> {
    return this.callbackFn(stateObj, payload, ctx);
  }

  accept(visitorFn: VisitorFunc): void {
    visitorFn(this, 'step.callback');
  }
}
export = Callback;
