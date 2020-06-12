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

export interface VisitorFunc {
  (element: unknown, kind: string): void;
}

export interface StepOptions {
  exitCodes: string[];
  breakable?: boolean;
  callbacks?: Record<string, CallbackFunc<unknown>>;
  entryPoints: Record<string, CallbackFunc<unknown>>;
}
