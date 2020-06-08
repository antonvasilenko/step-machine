/* eslint-disable no-console, import/no-extraneous-dependencies */
const graphviz = require('graphviz');

const setObj = (g, obj) => {
  Object.entries(obj).forEach(([k, v]) => g.set(k, v));
};

const getDotStr = (stateMachine) => {
  const g = graphviz.digraph('G');
  setObj(g, { label: 'Digi Step Machine', labelloc: 't' });

  const visitStep = (step) => {
    g.addNode(step.name, {
      shape: 'box3d',
      xlabel: step.name,
      width: 1.5,
    });
  };

  const visitState = (state) =>
    g.addNode(state, { shape: 'point', color: 'blue', width: 0.1, xlabel: state });

  const visitTransition = (transition) => {
    const { step, exitCode, to, next } = transition;
    g.addEdge(step.name, to, {
      dir: 'both',
      arrowhead: 'onormal',
      arrowtail: 'oinv',
      minlen: 2,
      taillabel: exitCode.split(':')[1],
    });
    if (next) {
      g.addEdge(to, `${next.step.name}`, {
        labeltarget: next.name,
        minlen: 2,
        arrowhead: 'odotonormal',
      });
    }
  };

  const visit = (element, kind) => {
    switch (kind) {
      case 'state':
        visitState(element);
        break;
      case 'step':
        visitStep(element);
        break;
      case 'transition':
        visitTransition(element);
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
