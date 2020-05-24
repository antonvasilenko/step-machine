const logger = require('veve-logger');
const states = require('./states');
const transitions = require('./transitions');
const Commands = require('./commands');

const finiteStateMachine = {
  initial: 'new',
  final: ['terminated', 'completed'],
  states,
  transitions,
};

const stateManager = {
  Commands,
  sendCommand: (digi, command, payload) => {
    const state = finiteStateMachine.states[digi.state];
    if (!state) throw Error(`Cound not find specified state ${digi.state}`);

    const transition = state.on[command];
    if (!transition)
      throw Error(`Could not find specified state (${digi.state}) transition (${command})`);

    logger.info(
      `Executing transition of digi ${digi._id} from state ${digi.state} with command ${command}`,
    );
    return transition
      .before(digi, payload)
      .then(() => {
        logger.info(`Changing digi ${digi._id} state: ${digi.state} => ${transition.to}`);
        return digi.setState(transition.to);
      })
      .then(() => (transition.after ? transition.after(digi, stateManager) : digi));
  },
};