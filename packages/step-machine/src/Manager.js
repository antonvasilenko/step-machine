const Step = require('./Step');

class Manager {
  constructor(
    states,
    steps,
    options = {
      getState: (value) => value.state,
      setState: async (value, state) => {
        // eslint-disable-next-line no-param-reassign
        value.state = state;
      },
      // eslint-disable-next-line no-console
      log: console.log,
    },
  ) {
    // TODO validate inputs
    this.states = Object.freeze(states);
    this.steps = Object.freeze(steps);
    this.options = options;

    this.callback = this.callback.bind(this);
    this.next = this.next.bind(this);
    this.accept = this.accept.bind(this);
  }

  log(...args) {
    this.options.log(...args);
  }

  intResolveCallback(state, stepName, callbackName) {
    const stateDefinition = this.states[state];
    if (!stateDefinition) {
      throw new Error(`Cound not find a definition for state ${state}`);
    }
    const callback = (stateDefinition.onCallback || []).find(
      (cb) => cb.step.name === stepName && cb.name === callbackName,
    );
    if (!callback) {
      throw new Error(
        `No callback ${callbackName} in step ${stepName} for state ${state}. Check step and callback names.`,
      );
    }
    return callback;
  }

  /**
   * This is just as next, but with optional payload.
   * Use to handle callback - continuation of a step that waits for an external process completion.
   */
  callback(stateObject, stepName, callbackName, payload) {
    const currentObjectState = this.options.getState(stateObject);
    const callback = this.intResolveCallback(currentObjectState, stepName, callbackName);
    return callback.fn(stateObject, payload, this.getStepContext(callback.step));
  }

  intResolveExitPoint(state, step, exitCode) {
    const stateDefinition = this.states[state];
    if (!stateDefinition) {
      throw new Error(`Cound not find a definition for state ${state}`);
    }
    // TODO check if exitcode actually declared in the step
    const exitPoint = stateDefinition.onExit[Step.getfullExitCode(step, exitCode)];
    if (!exitPoint) {
      throw new Error(`Could not find the definition of exit point ${exitCode} for state ${state}`);
    }
    return exitPoint;
  }

  getStepContext(step) {
    return {
      exit: (obj, exitCode) => this.next(obj, step, exitCode),
    };
  }

  /**
   *  this should be triggered somehow when step returns [digi, exit code];
   *  Should not be used directly.
   *  */
  async next(stateObject, step, exitCode) {
    if (exitCode === Step.EXIT_CODES.WAIT) {
      // TODO check if step allows breaks
      return stateObject;
    }
    const currentObjectState = this.options.getState(stateObject);
    const { to: targetState, next: entryPoint } = this.intResolveExitPoint(
      currentObjectState,
      step,
      exitCode,
    );

    this.log(`Changing state: ${currentObjectState} => ${targetState}`);
    const updatedStateObject = await this.options.setState(stateObject, targetState);
    return entryPoint
      ? entryPoint.fn(stateObject, this.getStepContext(entryPoint.step))
      : updatedStateObject;
  }

  accept(visitorFn) {
    Object.entries(this.states).forEach(([name, value]) =>
      visitorFn(
        {
          name,
          ...value,
        },
        'state',
      ),
    );
    this.steps.forEach((step) => step.accept(visitorFn));
    Object.values(this.states).forEach((state) => {
      if (state.onExit) {
        // visit connections between exit and entry points
        Object.entries(state.onExit).forEach(([exitCode, { to, next }]) => {
          const stepName = exitCode.split(':')[0];
          const step = this.steps.find((s) => s.name === stepName);
          visitorFn(
            {
              step,
              exitCode,
              to,
              next,
            },
            'transition',
          );
        });
      }
    });
  }
}

module.exports = Manager;
