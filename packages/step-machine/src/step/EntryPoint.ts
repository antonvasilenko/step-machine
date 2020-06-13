import Step from './Step';
import { EntryFunc, ExecutionContext, Element, VisitorFunc } from './types';

class EntryPoint<StateObject> implements Element {
  constructor(
    public step: Step<StateObject>,
    public name: string,
    private entryFn: EntryFunc<StateObject>,
  ) {}

  invoke(stateObj: StateObject, ctx: ExecutionContext<StateObject>): PromiseLike<StateObject> {
    return this.entryFn(stateObj, ctx);
  }

  accept(visitorFn: VisitorFunc): void {
    visitorFn(this, 'step.exitcode');
  }
}
export = EntryPoint;
