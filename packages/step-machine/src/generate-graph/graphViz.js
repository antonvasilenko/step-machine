/* eslint-disable no-console, import/no-extraneous-dependencies */
const graphviz = require('graphviz');

const setObj = (g, obj) => {
  Object.entries(obj).forEach(([k, v]) => g.set(k, v));
};

const getDotStr = (stateMachine) => {
  const g = graphviz.digraph('G');
  setObj(g, { label: 'Digi Step Machine', labelloc: 't', splines: true });

  const visitStep = (step) => {
    g.addNode(step.name, {
      shape: 'box3d',
      width: 1.5,
    });
  };

  const visitStepCallback = (stepCallback) => {
    const fullCallbackName = `${stepCallback.step.name}:${stepCallback.name}`;
    g.addNode(fullCallbackName, {
      shape: 'plain',
      color: 'magenta',
      width: 0.1,
      label: stepCallback.name,
    });
    g.addEdge(fullCallbackName, stepCallback.step.name, {
      arrowhead: 'onormal',
      minlen: 1,
      style: 'dashed',
    });
  };

  const visitState = (state) => {
    if (state.final) {
      g.addNode(state.name, {
        shape: 'doublecircle',
        color: 'brown',
        width: 0.05,
        style: 'bold',
        xlabel: state.name,
        label: '',
      });
      return;
    }
    if (state.initialEnter) {
      g.addNode(state.name, {
        shape: 'doublecircle',
        color: 'seagreen',
        style: 'bold',
        width: 0.05,
        xlabel: state.name,
        label: '',
      });
      g.addEdge(state.name, state.initialEnter.step.name, {
        headlabel: state.initialEnter.name,
        arrowhead: 'onormal',
        minlen: 1,
        style: 'dotted',
      });
      return;
    }
    g.addNode(state.name, { shape: 'point', color: 'blue', width: 0.1, xlabel: state.name });
  };

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
      case 'step.callback':
        visitStepCallback(element);
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
