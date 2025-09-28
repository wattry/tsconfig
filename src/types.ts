export const baseDir = 'node_modules/@wattry/tsconfig' as const;
export const tsConfigPath = `${process.env?.['PWD']}/${baseDir}` as const;
export const choices = ['pnpm', 'npm', 'yarn'] as const;
export type ConfigMap = Map<string, string>;

export interface BasePkgJson {
  type: string;
  name: string;
  description: string;
  version: string;
  types: string;
  files: string[];
  main: string;
  module: string;
  exports: Record<string, unknown>;
  devDependencies: Record<string, string>;
  scripts: Record<string, string>;
  license: string;
}

export interface Options {
  packageManager: (typeof choices)[number];
  debug: boolean;
  verbose: boolean;
}

export type PkgJson = Partial<BasePkgJson>;

export enum LogLevel {
  error,
  warn,
  info,
  debug,
  trace
}

export type LogLevelOption = keyof typeof LogLevel;

export default {
  baseDir,
  tsConfigPath,
  choices,
  LogLevel
};
