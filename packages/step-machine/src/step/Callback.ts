import Step from './Step';
import { CallbackFunc, ExecutionContext } from './types';

class Callback<StateObject> {
  constructor(
    public step: Step,
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
}
export = Callback;
