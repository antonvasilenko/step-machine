/* eslint-disable no-console, import/no-extraneous-dependencies */
const graphlib = require('@dagrejs/graphlib');
const dot = require('graphlib-dot');

const getDotStr = (stateMachine) => {
  const g = new graphlib.Graph();

  // Object.keys(stateMachine.states).forEach((stateKey) => {
  // g.setNode(stateKey);
  // const state = fsm.states[stateKey];
  // Object.keys(state.on).forEach((commandName) => {
  //   const transition = state.on[commandName];
  //   g.setEdge(stateKey, transition.to, { label: commandName });
  // });
  // });

  const visit = (element, kind) => {
    switch (kind) {
      case 'state':
        g.setNode(element);
        break;
      default:
        break;
    }
  };
  stateMachine.accept(visit);

  const graphStr = dot.write(g);
  return graphStr;
};

module.exports = getDotStr;
