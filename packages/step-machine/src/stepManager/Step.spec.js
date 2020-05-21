const Step = require('./Step');

describe('Step', () => {
  const defOpts = {
    entryPoints: {
      start: () => 'wait',
    },
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
  it('creates step', () => {
    const step = new Step('a', defOpts);
    expect(step).toBeInstanceOf(Step);
  });
  describe('when awaitable/async/breakable', () => {
    const opts = {
      ...defOpts,
      callbacks: { onUserSubmit: () => 'ok' },
    };
    describe('when callbacks provided', () => {
      it('requires breakable flag when has callbacks', () => {
        expect(() => new Step('br', opts)).toThrow(Error);
      });

      it('holds provided callbacks', () => {
        const step = new Step('br', {
          ...opts,
          breakable: true,
        });
        expect(step.callbacks).toHaveProperty('onUserSubmit', expect.any(Function));
      });
    });
  });
});
