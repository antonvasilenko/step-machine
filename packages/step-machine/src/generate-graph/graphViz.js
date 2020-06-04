/* eslint-disable no-console, import/no-extraneous-dependencies */
const graphviz = require('graphviz');

const setObj = (g, obj) => {
  Object.entries(obj).forEach(([k, v]) => g.set(k, v));
};

const getDotStr = (stateMachine) => {
  const g = graphviz.digraph('G');
  setObj(g, { label: 'Digi Step Machine', labelloc: 't' });
  // g.set('rankdir', 'LR');

  // Object.keys(stateMachine.states).forEach((stateKey) => {
  // g.setNode(stateKey);
  // const state = fsm.states[stateKey];
  // Object.keys(state.on).forEach((commandName) => {
  //   const transition = state.on[commandName];
  //   g.setEdge(stateKey, transition.to, { label: commandName });
  // });
  // });

  const visitStep = (step) => {
    g.addNode(step.name, {
      shape: 'Mrecord',
      xlabel: step.name,
      label: [
        `{${Object.values(step.entryPoints).map((ep) => ep.name)}}`,
        `{${Object.values(step.callbacks).map((cb) => cb.name)}|}`,
        `{${step.exitCodes.join('|')}}`,
      ].join('|'),
    });
  };

  const visit = (element, kind) => {
    switch (kind) {
      case 'state':
        g.addNode(element, { shape: 'point', color: 'blue', width: 0.3, xlabel: element });
        break;
      case 'step':
        visitStep(element);
        break;
      default:
        break;
    }
  };
  stateMachine.accept(visit);

  const graphStr = g.to_dot();
  return graphStr;
};

module.exports = getDotStr;
