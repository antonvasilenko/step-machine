const Step = require('./Step');

describe('Step', () => {
  const defOpts = {
    entryPoints: {
      start: () => 'wait',
    },
    exitCodes: ['done'],
  };
  it('requires step name', () => {
    expect(() => new Step('', {})).toThrow(Error);
  });
  it('requires step options', () => {
    expect(() => new Step('validation')).toThrow(Error);
  });
  it('requires at least one entry point', () => {
    const entryPoints = {
      start: null,
    };
    expect(
      () =>
        new Step('a', {
          entryPoints,
        }),
    ).toThrow(Error);
  });
  it('requires at least one exit code', () => {
    const entryPoints = {
      start: null,
    };
    expect(
      () =>
        new Step('a', {
          entryPoints,
          exitCodes: [],
        }),
    ).toThrow(Error);
  });
  it('creates step', () => {
    const step = new Step('a', defOpts);
    expect(step).toBeInstanceOf(Step);
  });
  describe('when awaitable/async/breakable', () => {
    let breakableOpts = null;
    beforeEach(() => {
      breakableOpts = {
        ...defOpts,
        callbacks: { onUserSubmit: () => Promise.resolve('done') },
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
      expect(step.callbacks.onUserSubmit).toBeInstanceOf(Step.Callback);
    });
  });
});
