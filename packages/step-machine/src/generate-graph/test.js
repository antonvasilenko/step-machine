/* eslint-disable no-console, import/no-extraneous-dependencies */
const fs = require('fs-extra');
const saveAs = require('./saveAs');
const graph = require('./graphViz');
const { Step, Manager } = require('../stepManager');

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
    initial: true,
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

const stepManager = new Manager(states, [step1, step2]);

fs.ensureDirSync('doc');

const graphStr = graph(stepManager);
fs.writeFileSync('doc/graphlib.dot', graphStr);
process.exit(0);

saveAs(graphStr, 'svg', 'doc/graphlib.svg')
  .then(() => process.exit(0))
  .then(() => saveAs(graphStr, 'png', 'doc/digi-graph.png'))
  .catch((err) => {
    console.error('Save graph as image failed', err);
    process.exit(1);
  });
