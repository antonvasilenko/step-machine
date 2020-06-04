// Later create StepOptions with build() and validate();

// eslint-disable-next-line max-classes-per-file
const EXIT_CODES = {
  WAIT: 'wait',
};

const hasOptions = (options) => !!options;

const hasEntries = (options) => options.entryPoints && Object.keys(options.entryPoints).length > 0;
const validEntries = (options) =>
  Object.entries(options.entryPoints).every(
    ([key, func]) => key && func && typeof func === 'function',
  );

const hasCallbacks = (options) => options.callbacks && Object.keys(options.callbacks).length > 0;
const validCallbacks = (options) =>
  Object.entries(options.callbacks).every(
    ([key, func]) => key && func && typeof func === 'function',
  );

const isBreakable = (options) => options.breakable === true;

const hasExitCodes = (options) => options.exitCodes && options.exitCodes.length > 0;
const validExitCodes = (options) => options.exitCodes.every((ec) => typeof ec === 'string');
const validWaitExitCode = (options) => {
  if (isBreakable(options)) {
    return options.exitCodes.includes(EXIT_CODES.WAIT);
  }
  return !options.exitCodes.includes(EXIT_CODES.WAIT);
};

const validateName = (name) => {
  if (!name) {
    throw new Error('Step should always have a name');
  }
  if (!/^[a-z_]+$/.test(name)) {
    throw new Error('Invalid name, should be only lower case letters and underscore');
  }
};

const validateOptions = (options) => {
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

const normalizeEnumValue = (key) => `${key.replace(' ', '_')}`;
const normalizeKey = (name, key) => `${name}:${key.replace(' ', '_')}`;

class EntryPoint {
  constructor(step, name, entryFn) {
    this.step = step;
    this.name = name;
    this.fn = entryFn;
  }

  invoke(ctx) {
    return this.fn(ctx);
  }
}

class Callback {
  constructor(step, name, callbackFn) {
    this.step = step;
    this.name = name;
    this.fn = callbackFn;
  }

  invoke(ctx) {
    return this.fn(ctx);
  }
}

class Step {
  constructor(name, options) {
    validateName(name);
    this.name = name;
    validateOptions(options);
    this.entryPoints = Object.freeze(
      Object.entries(options.entryPoints).reduce((acc, [key, fn]) => {
        acc[key] = new EntryPoint(this, key, fn);
        return acc;
      }, {}),
    );
    this.callbacks = Object.freeze(
      Object.entries(options.callbacks || {}).reduce((acc, [key, fn]) => {
        acc[key] = new Callback(this, key, fn);
        return acc;
      }, {}),
    );
    this.exitCodes = options.exitCodes || [];
    this.ExitCode = Object.freeze(
      this.exitCodes.reduce((acc, code) => {
        const key = normalizeEnumValue(code);
        acc[key] = normalizeKey(this.name, code);
        return acc;
      }, {}),
    );
  }

  static getfullExitCode(step, exitCode) {
    return normalizeKey(step.name, exitCode);
  }

  accept(visitorFn) {
    visitorFn(this, 'step');
  }
}

Step.EXIT_CODES = EXIT_CODES;
Step.Callback = Callback;
Step.EntryPoint = EntryPoint;

module.exports = Step;
