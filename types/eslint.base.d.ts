import type { ConfigWithExtendsArray } from '@eslint/config-helpers';

export interface EslintBaseOptions {
  ignores: string[];
  files: string[];
}

export type CreateBaseConfig =
  (importMeta: ImportMeta, options: EslintBaseOptions) => ConfigWithExtendsArray;

export function createBaseConfig(importMeta: ImportMeta, options: EslintBaseOptions): ConfigWithExtendsArray;
