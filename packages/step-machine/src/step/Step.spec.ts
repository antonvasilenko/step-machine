import Step = require('./Step');
import Callback = require('./Callback');
import { StepOptions, ExecutionContext, CallbackFunc, EntryFunc } from './types';

describe('Step', () => {
  const defOpts = {
    entryPoints: {
      start: (stObj, ctx: ExecutionContext<unknown>) => ctx.exit(stObj, 'wait'),
    },
    exitCodes: ['done'],
  } as StepOptions;
  it('requires step name', () => {
    expect(() => new Step('', {} as StepOptions)).toThrow(Error);
  });
  it('requires step options', () => {
    expect(() => new Step('validation', null)).toThrow(Error);
  });
  it('requires at least one entry point', () => {
    const opts: StepOptions = {
      entryPoints: {},
      exitCodes: [],
    };
    expect(() => new Step('a', opts)).toThrow(Error);
  });
  it('requires at least one exit code', () => {
    const start: EntryFunc<unknown> = (obj, ctx) => ctx.exit(obj, 'dummy');
    expect(
      () =>
        new Step('a', {
          entryPoints: {
            start,
          },
          exitCodes: [],
        }),
    ).toThrow(Error);
  });
  it('creates step', () => {
    const step = new Step('a', defOpts);
    expect(step).toBeInstanceOf(Step);
  });
  describe('when awaitable/async/breakable', () => {
    let breakableOpts: StepOptions = null;
    beforeEach(() => {
      breakableOpts = {
        ...defOpts,
        callbacks: { onUserSubmit: async (digi, _payload, ctx) => ctx.exit(digi, 'done') },
        breakable: true,
        exitCodes: ['done', Step.EXIT_CODES.WAIT],
      };
    });
    it('requires breakable flag', () => {
      breakableOpts.breakable = undefined;
      expect(() => new Step('br', breakableOpts)).toThrow(Error);
    });
    it('requires wait exit code', () => {
      breakableOpts.exitCodes = ['done'];
      expect(() => new Step('br', breakableOpts)).toThrow(/exit code/);
    });
    it('requires callback', () => {
      breakableOpts.callbacks = { onCallback: null };
      expect(() => new Step('br', breakableOpts)).toThrow(/invalid callbacks/);
    });

    it('holds provided callbacks', () => {
      const step = new Step('br', breakableOpts);
      expect(step.callbacks.onUserSubmit).toBeInstanceOf(Callback);
    });
  });
});
