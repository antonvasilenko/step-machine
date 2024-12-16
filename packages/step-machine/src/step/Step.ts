import EntryPoint from './EntryPoint';
import Callback from './Callback';
import { VisitorFunc, StepOptions, Element } from './types';

const EXIT_CODES = {
  WAIT: 'wait',
};

const hasOptions = (options: StepOptions<unknown>) => !!options;

const hasEntries = (options: StepOptions<unknown>) =>
  options.entryPoints && Object.keys(options.entryPoints).length > 0;
const validEntries = (options: StepOptions<unknown>) =>
  Object.entries(options.entryPoints).every(
    ([key, func]) => key && func && typeof func === 'function',
  );

const hasCallbacks = (options: StepOptions<unknown>) =>
  options.callbacks && Object.keys(options.callbacks).length > 0;
const validCallbacks = (options: StepOptions<unknown>) =>
  Object.entries(options.callbacks).every(
    ([key, func]) => key && func && typeof func === 'function',
  );

const isBreakable = (options: StepOptions<unknown>) => options.breakable === true;

const hasExitCodes = (options: StepOptions<unknown>) =>
  options.exitCodes && options.exitCodes.length > 0;
const validExitCodes = (options: StepOptions<unknown>) =>
  options.exitCodes.every((ec) => typeof ec === 'string');
const validWaitExitCode = (options: StepOptions<unknown>) => {
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
const validateOptions = (options: StepOptions<unknown>) => {
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

class Step<StateObject> implements Element {
  public entryPoints: Readonly<Record<string, EntryPoint<StateObject>>>;
  public callbacks: Readonly<Record<string, Callback<StateObject>>>;
  exitCodes: string[];
  ExitCode: Readonly<Record<string, string>>;
  constructor(public name: string, options: StepOptions<StateObject>) {
    validateName(name);
    validateOptions(options);
    this.entryPoints = Object.freeze(
      Object.entries(options.entryPoints).reduce((acc, [key, fn]) => {
        acc[key] = new EntryPoint<StateObject>(this, key, fn);
        return acc;
      }, {} as Record<string, EntryPoint<StateObject>>),
    );
    this.callbacks = Object.freeze(
      Object.entries(options.callbacks || {}).reduce((acc, [key, fn]) => {
        acc[key] = new Callback<StateObject>(this, key, fn);
        return acc;
      }, {} as Record<string, Callback<StateObject>>),
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

  static getfullExitCode(step: Step<unknown>, exitCode: string): string {
    return normalizeKey(step.name, exitCode);
  }

  accept(visitorFn: VisitorFunc): void {
    visitorFn(this, 'step');
    Object.values(this.callbacks).forEach((cb) => cb.accept(visitorFn));
    Object.values(this.entryPoints).forEach((ep) => visitorFn(ep, 'step.entrypoint'));
    this.exitCodes.forEach((ec) => visitorFn(ec, 'step.exitcode'));
  }

  static EXIT_CODES = EXIT_CODES;
}

export = Step;
