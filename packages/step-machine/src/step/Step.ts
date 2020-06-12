import EntryPoint from './EntryPoint';
import Callback from './Callback';
import { VisitorFunc, StepOptions } from './types';

const EXIT_CODES = {
  WAIT: 'wait',
};

const hasOptions = (options: StepOptions) => !!options;

const hasEntries = (options: StepOptions) =>
  options.entryPoints && Object.keys(options.entryPoints).length > 0;
const validEntries = (options: StepOptions) =>
  Object.entries(options.entryPoints).every(
    ([key, func]) => key && func && typeof func === 'function',
  );

const hasCallbacks = (options: StepOptions) =>
  options.callbacks && Object.keys(options.callbacks).length > 0;
const validCallbacks = (options: StepOptions) =>
  Object.entries(options.callbacks).every(
    ([key, func]) => key && func && typeof func === 'function',
  );

const isBreakable = (options: StepOptions) => options.breakable === true;

const hasExitCodes = (options: StepOptions) => options.exitCodes && options.exitCodes.length > 0;
const validExitCodes = (options: StepOptions) =>
  options.exitCodes.every((ec) => typeof ec === 'string');
const validWaitExitCode = (options: StepOptions) => {
  if (isBreakable(options)) {
    return options.exitCodes.includes(EXIT_CODES.WAIT);
  }
  return !options.exitCodes.includes(EXIT_CODES.WAIT);
};

const validateName = (name: string) => {
  if (!name) {
    throw new Error('Step should always have a name');
  }
  if (!/^[a-z_]+$/.test(name)) {
    throw new Error('Invalid name, should be only lower case letters and underscore');
  }
};

// eslint-disable-next-line complexity, max-lines-per-function
const validateOptions = (options: StepOptions) => {
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

const normalizeEnumValue = (key: string) => `${key.replace(' ', '_')}`;
const normalizeKey = (name: string, key: string) => `${name}:${key.replace(' ', '_')}`;

class Step {
  public entryPoints: Readonly<Record<string, EntryPoint>>;
  public callbacks: Readonly<Record<string, Callback>>;
  exitCodes: string[];
  ExitCode: Readonly<Record<string, string>>;
  constructor(public name: string, options: StepOptions) {
    validateName(name);
    validateOptions(options);
    this.entryPoints = Object.freeze(
      Object.entries(options.entryPoints).reduce((acc, [key, fn]) => {
        acc[key] = new EntryPoint(this, key, fn);
        return acc;
      }, {} as Record<string, EntryPoint>),
    );
    this.callbacks = Object.freeze(
      Object.entries(options.callbacks || {}).reduce((acc, [key, fn]) => {
        acc[key] = new Callback(this, key, fn);
        return acc;
      }, {} as Record<string, Callback>),
    );
    this.exitCodes = options.exitCodes || [];
    this.ExitCode = Object.freeze(
      this.exitCodes.reduce((acc, code) => {
        const key = normalizeEnumValue(code);
        acc[key] = normalizeKey(this.name, code);
        return acc;
      }, {} as Record<string, string>),
    );
  }

  static getfullExitCode(step: Step, exitCode: string) {
    return normalizeKey(step.name, exitCode);
  }

  accept(visitorFn: VisitorFunc) {
    visitorFn(this, 'step');
    Object.values(this.callbacks).forEach((cb) => visitorFn(cb, 'step.callback'));
    Object.values(this.entryPoints).forEach((ep) => visitorFn(ep, 'step.entrypoint'));
    this.exitCodes.forEach((ec) => visitorFn(ec, 'step.exitcode'));
  }

  static EXIT_CODES = EXIT_CODES;
}

export = Step;
