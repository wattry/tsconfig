import { LogLevel, LogLevelOption } from './types.js';

export let logger: CLogger;

class CLogger {
  level: LogLevel = LogLevel['info'];
  name: string = '<tsconfig>';

  constructor(level?: LogLevelOption) {
    this.level = LogLevel[level as LogLevelOption];
    this.name = `${this.name} [${(level as LogLevelOption).toUpperCase()}] - `;
  }

  error(...args: unknown[]) {
    globalThis.console.error(this.name, ...args);
  }

  warn(...args: unknown[]) {
    globalThis.console.warn(this.name, ...args);
  }

  info(...args: unknown[]) {
    globalThis.console.info(this.name, ...args);
  }

  debug(...args: unknown[]) {
    if (this.level > 2) {
      globalThis.console.debug(this.name, ...args);
    }
  }

  trace(...args: unknown[]) {
    if (this.level > 3) {
      globalThis.console.trace(this.name, ...args);
    }
  }
}

export function Logger(level?: LogLevelOption) {
  logger = new CLogger(level);

  return logger;
}
