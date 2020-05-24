class Manager {
  constructor(states, steps, options = {
    getState = (value) => value.state,
    setState = async (value, state) => (value.state = state),
  }) {
    // TODO validate inputs
    this.states = Object.freeze(states);
    this.steps = Object.freeze(steps);
    this.options = options;

    this.callback = this.callback.bind(this);
  }

  /**
   * This is just as next, but with optional payload.
   * Use to handle callback - continuation of a step that waits for an external process completion.
   * TODO:
   * 1. use StateObject to wrap digi and make Manager entity agnostic
  */
  callback(stateObject, callbackName, payload) {
    const currentObjectState = this.options.getState(stateObject);
    const stateDefinition = this.states[currentObjectState];
    if (!stateDefinition) {
      throw new Error(`Cound not find a definition for state ${currentObjectState}`);
    }

    const callbackDefinition = currentStateTransitions.onCallback[callbackName];
    if (!callbackDefinition)
      throw new Error(`Could not find the definition of callback ${callbackName} for state ${currentObjectState}`);

    const [step, stepCallbackName = callbackName] = callbackDefinition;
    console.log(
      `Executing callback ${step.name}:${stepCallbackName} for object in state ${currentObjectState}`,
    );
    const callbackFn = step.callbacks[stepCallbackName];
    if (typeof callbackFn !== 'function') {
      throw new Error(`Callback ${stepCallbackName} not defined in step ${step.name}`);
    }
    return callbackFn(digi, payload)
      .then(([digi, exitCode])=> this.next(digi, exitCode))
      .then(() => {
        console.log(`Changing digi ${digi._id} state: ${digi.state} => ${transition.to}`);
        return digi.setState(transition.to);
      })
      .then(() => (transition.after ? transition.after(digi, stateManager) : digi));
  }

  /**
   *  this should be triggered somehow when step returns [digi, exit code];
   *  */
  next(digi, exitCode) {
    let nextFn = null;
    let targetState = '';
    // TODO resolve step.nextFn()
    return Promise.resolve(digi)
    .then(d => {
      console.log(`Changing digi ${d._id} state: ${d.state} => ${targetState}`);
      return d.setState(targetState);
    })
    .then((d) => nextFn ? nextFn(d): d);
  }
}

module.exports = Manager;
