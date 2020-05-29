/* eslint-disable no-console */
const Manager = require('./Manager');
const Step = require('./Step');

describe('Manager', () => {
  it('machine with 2 simple sync step created', () => {
    // simple step definition
    // begin -> start step1 ok -> start step2 ok -> end
    const step1 = new Step('step_one', {
      entryPoints: {
        start: async (digi) => {
          console.log('Starting step1');
          console.log('Doing step1 job');
          console.log('Exiting step1 with success');
          return [digi, 'ok'];
        },
      },
      breakable: false,
      exitCodes: ['ok'],
    });
    const step2 = new Step('step_two', {
      entryPoints: {
        start: async (digi) => {
          console.log('Starting step2');
          console.log('Doing step2 job');
          console.log('Exiting step2 with success');
          return [digi, 'ok'];
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
            // TODO maybe box it in wrapper object with name and reference to the step
            next: [step2, step2.EntryPoint.start], // a.k.a. after
          },
        },
        initial: true,
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

  it('machine with breakable step simple sync step created', () => {
    // simple step definition
    // begin -> start step1 ok -> start step2 ok -> end
    const step1 = new Step('step_one', {
      entryPoints: {
        start: async (digi) => {
          console.log('Starting step1');
          console.log('Doing step1 job');
          console.log('Exiting step1 with success');
          return [digi, 'ok'];
        },
      },
      breakable: false,
      exitCodes: ['ok'],
    });
    const step2 = new Step('step_two', {
      entryPoints: {
        start: async (digi) => {
          console.log('Step2: Starting');
          console.log('Step2: Doing job');
          console.log('Step2: Breaking until user submits the form');
          return [digi, 'wait']; // ctx.exit('wait', updatedDigi);
        },
      },
      callbacks: {
        onUserSubmit: (digi, payload) => {
          console.log('Step3: Got some paylad back from user for');
          console.log('Step3: Processing user payload', payload);
          return [digi, 'ok']; // ctx.exit('ok', updatedDigi);
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
            // TODO maybe box it in wrapper object with name and reference to the step
            next: [step2, step2.EntryPoint.start], // a.k.a. after
          },
        },
        initial: true,
      },
      step_one_done: {
        onExit: {
          [step2.ExitCode.ok]: {
            to: 'completed',
          },
        },
      },
      step_two_done: {
        onCallback: {
          [step3.Callback.onUserSubmit]: [step3, step3.callbacks.onUserSubmit],
        },
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
    const stepManager = new Manager(states, [step1, step2, step3]);
    expect(stepManager).toBeInstanceOf(Manager);
  });
});
