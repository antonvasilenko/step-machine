import Step from './Step';
import { EntryFunc, ExecutionContext } from './types';

class EntryPoint<StateObject> {
  constructor(public step: Step, public name: string, private entryFn: EntryFunc<StateObject>) {}

  invoke(stateObj: StateObject, ctx: ExecutionContext<StateObject>): PromiseLike<StateObject> {
    return this.entryFn(stateObj, ctx);
  }
}
export = EntryPoint;
