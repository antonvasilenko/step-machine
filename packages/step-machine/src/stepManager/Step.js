// Later create StepOptions with build() and validate();

const EXIT_CODES = {
  WAIT: 'wait',
};

const hasOptions = options => !!options;

const hasEntries = options => options.entryPoints && Object.keys(options.entryPoints).length > 0;
const validEntries = options =>
  Object.entries(options.entryPoints).every(
    ([key, func]) => key && func && typeof func === 'function',
  );

const hasCallbacks = options => options.callbacks && Object.keys(options.callbacks).length > 0;
const validCallbacks = options =>
  Object.entries(options.callbacks).every(
    ([key, func]) => key && func && typeof func === 'function',
  );

const isBreakable = options => options.breakable === true;

const hasExitCodes = options => options.exitCodes && options.exitCodes.length > 0;
const validExitCodes = options => options.exitCodes.every(ec => typeof ec === 'string');
const validWaitExitCode = options => {
  if (isBreakable(options)) {
    return options.exitCodes.includes(EXIT_CODES.WAIT);
  }
  return !options.exitCodes.includes(EXIT_CODES.WAIT);
}


const validateOptions = options => {
  if (!hasOptions(options)) {
    throw new Error('Options are mandatory');
  }
  if (!hasEntries(options)) {
    throw new Error('At least one entry point should be defined');
  }
  if (!validEntries(options)) {
    throw new Error('invalid entries, should be functions');
  }
  if (hasCallbacks(options)) {
    if (!validCallbacks(options)) {
      throw new Error('invalid callbacks, should be functions');
    }
    if (!isBreakable(options)) {
      throw new Error('breakable should be enabled if callbacks defined');
    }
  }
  if (!hasExitCodes(options)) {
    throw new Error('At least one custom exit code should be defined');
  }
  if (!validExitCodes(options)) {
    throw new Error('invalid exit codes, should be strings');
  }
  if (!validWaitExitCode(options)) {
    throw new Error('Breakable steps should have "wait" exit code, unbreakable - should not.');
  }
};

class Step {
  constructor(name, options) {
    if (!name) {
      throw new Error('Step should always have a name');
    }
    this.name = name;
    validateOptions(options);
    this.entryPoints = options.entryPoints;
    this.callbacks = options.callbacks;
    this.exitCodes = options.exitCodes;
  }
}

Step.EXIT_CODES = EXIT_CODES;

module.exports = Step;
