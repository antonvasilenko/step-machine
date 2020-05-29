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
  }

  log(...args) {
    this.options.log(...args);
  }

  intResolveCallback(state, callbackName) {
    const stateDefinition = this.states[state];
    if (!stateDefinition) {
      throw new Error(`Cound not find a definition for state ${state}`);
    }

    const callbackDefinition = stateDefinition.onCallback[callbackName];
    if (!callbackDefinition) {
      throw new Error(
        `Could not find the definition of callback ${callbackName} for state ${state}`,
      );
    }

    const [step, stepCallbackName = callbackName] = callbackDefinition;
    const callbackFn = step.callbacks[stepCallbackName];
    return callbackFn;
  }

  /**
   * This is just as next, but with optional payload.
   * Use to handle callback - continuation of a step that waits for an external process completion.
   * TODO:
   * 1. use StateObject to wrap digi and make Manager entity agnostic
   */
  callback(stateObject, callbackName, payload) {
    const currentObjectState = this.options.getState(stateObject);
    const callbackFn = this.intResolveCallback(currentObjectState, callbackName);

    return callbackFn(stateObject, payload).then(([updatedStateObject, exitCode]) =>
      this.next(updatedStateObject, exitCode),
    );
    // .then(() => {
    //   console.log(`Changing digi ${digi._id} state: ${digi.state} => ${transition.to}`);
    //   return digi.setState(transition.to);
    // })
    // .then(() => (transition.after ? transition.after(digi, stateManager) : digi));
  }

  intResolveExitPoint(state, exitCode) {
    const stateDefinition = this.states[state];
    if (!stateDefinition) {
      throw new Error(`Cound not find a definition for state ${state}`);
    }
    const exitDefinition = stateDefinition.onExit[exitCode];
    if (!exitDefinition) {
      throw new Error(`Could not find the definition of exit point ${exitCode} for state ${state}`);
    }
    const { to: targetState, next } = exitDefinition;
    let entryPointFn = null;
    if (next) {
      const [step, entryPointName] = next;
      entryPointFn = step.entryPoints[entryPointName];
      if (typeof entryPointFn !== 'function') {
        throw new Error(`Could not find the entry point ${entryPointName} for step ${step.name}`);
      }
    }
    return [targetState, entryPointFn];
  }

  /**
   *  this should be triggered somehow when step returns [digi, exit code];
   *  */
  next(stateObject, exitCode) {
    const currentObjectState = this.options.getState(stateObject);
    const [targetState, entryPointFn] = this.intResolveExitPoint(currentObjectState, exitCode);

    // TODO handle special exit code wait
    return Promise.resolve()
      .then(() => {
        // eslint-disable-next-line no-console
        this.log(`Changing state: ${currentObjectState} => ${targetState}`);
        return this.options.setState(stateObject, targetState);
      })
      .then(() => {
        if (!entryPointFn) {
          return stateObject;
        }
        return entryPointFn(stateObject);
      });
  }
}

module.exports = Manager;
