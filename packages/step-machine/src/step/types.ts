export interface ExecutionContext<StateObject> {
  exit(stateObject: StateObject, exitCode: string): PromiseLike<StateObject>;
}

export interface CallbackFunc<StateObject> {
  (stateObj: StateObject, payload: unknown, ctx: ExecutionContext<StateObject>): PromiseLike<
    StateObject
  >;
}

export interface EntryFunc<StateObject> {
  (stateObj: StateObject, ctx: ExecutionContext<StateObject>): PromiseLike<StateObject>;
}

export interface Element {
  accept(visitorFn: VisitorFunc): void;
}

export interface VisitorFunc {
  (element: Element | unknown, kind: string): void;
}

export interface StepOptions<StateObject> {
  exitCodes: string[];
  breakable?: boolean;
  callbacks?: Record<string, CallbackFunc<StateObject>>;
  entryPoints: Record<string, EntryFunc<StateObject>>;
}
