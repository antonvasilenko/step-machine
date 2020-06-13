const Manager = require('./Manager');
const Step = require('./step/Step');

describe('Manager', () => {
  it('machine with 2 simple sync step created', () => {
    // simple step definition
    // begin -> start step1 ok -> start step2 ok -> end
    const step1 = new Step('step_one', {
      entryPoints: {
        start: async (digi, ctx) => {
          console.log('Starting step1');
          console.log('Doing step1 job');
          console.log('Exiting step1 with success');
          return ctx.exit(digi, 'ok');
        },
      },
      breakable: false,
      exitCodes: ['ok'],
    });
    const step2 = new Step('step_two', {
      entryPoints: {
        start: async (digi, ctx) => {
          console.log('Starting step2');
          console.log('Doing step2 job');
          console.log('Exiting step2 with success');
          return ctx.exit(digi, 'ok');
        },
      },
      breakable: false,
      exitCodes: ['ok'],
    });
    const states = {
      new: {
        onExit: {
          [step1.ExitCode.ok]: {
            to: 'step_one_done',
            next: step2.entryPoints.start, // a.k.a. after
          },
        },
        initialEnter: step1.entryPoints.start,
      },
      step_one_done: {
        onExit: {
          [step2.ExitCode.ok]: {
            to: 'completed',
          },
        },
      },
      completed: {
        final: true,
      },
    };
    const stepManager = new Manager(states, [step1, step2]);
    expect(stepManager).toBeInstanceOf(Manager);
  });
  describe('machine with breakable step', () => {
    // simple step definition
    // begin -> start step1 ok ->  end
    const step1 = new Step('step_one', {
      entryPoints: {
        start: async (digi, ctx) => {
          console.log('Step1: starting');
          console.log('Step1: doing the job');
          console.log('Step1: exit with success');
          return ctx.exit(digi, 'ok');
        },
      },
      breakable: false,
      exitCodes: ['ok'],
    });
    const step2 = new Step('step_two', {
      entryPoints: {
        start: async (digi, ctx) => {
          console.log('Step2: Starting');
          console.log('Step2: Doing job');
          console.log('Step2: Breaking until user submits the form');
          return ctx.exit(digi, 'wait');
        },
      },
      callbacks: {
        onUserSubmit: (digi, payload, ctx) => {
          console.log('Step2: Got some paylad back from user for');
          console.log('Step2: Processing user payload', payload);
          return ctx.exit(digi, 'ok');
        },
      },
      breakable: true,
      exitCodes: ['ok', 'wait'],
    });
    const states = {
      new: {
        onExit: {
          [step1.ExitCode.ok]: {
            to: 'step_one_done',
            next: step2.entryPoints.start, // a.k.a. after
          },
        },
        initialEnter: step1.entryPoints.start,
      },
      step_one_done: {
        onCallback: [step2.callbacks.onUserSubmit],
        onExit: {
          [step2.ExitCode.ok]: {
            to: 'completed',
          },
        },
      },
      completed: {
        final: true,
      },
    };
    it('created', () => {
      const stepManager = new Manager(states, [step1, step2]);
      expect(stepManager).toBeInstanceOf(Manager);
    });
    it('runs', async () => {
      const stepManager = new Manager(states, [step1, step2]);
      const obj = { state: 'new' };
      await step1.entryPoints.start.invoke(obj, stepManager.getStepContext(step1));
    });
    it('continues on callback', async () => {
      const stepManager = new Manager(states, [step1, step2]);
      const obj = { state: 'step_one_done' };
      await stepManager.callback(obj, 'step_two', 'onUserSubmit', { nickname: 'testnick' });
    });
  });
});
