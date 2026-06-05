import type { EncodingOption } from 'node:fs';
import fs from 'node:fs';
import path from 'node:path';

import { logger } from './logger.js';
import type { BasePkgJson, PkgJson, ConfigMap } from './types.js';

export const rmOptions = { recursive: true, force: true };
export const encoding: EncodingOption = { encoding: 'utf8' };

const ESLINT_WRAPPER = `import { defineConfig } from 'eslint/config';
import { createBaseConfig } from '@wattry/tsconfig/eslint';

const files = ['**/*.ts'];
const ignores = ['dist/**/*', 'node_modules/**/*'];

/**
 * You can override the base config like so
 * const customConfig = <your custom config>;
 * export default defineConfig(
 *   [createBaseConfig(import.meta, { files, ignores }), customConfig]
 * );
 */

export default defineConfig(
  createBaseConfig(import.meta, { files, ignores })
);
`;

const VITEST_WRAPPER = `import base from '@wattry/tsconfig/vitest';

/**
 * To extend this config adjust it as follows
 *
 * export default {
 *   ...base,
 *   // Project-level overrides go here
 * };
 */

export default base;
`;

export function writeWrappers(
  projectDir: string,
  baseTsConfig: { compilerOptions: Record<string, unknown>; include?: string[]; exclude?: string[] },
  buildTsConfig: { compilerOptions: Record<string, unknown>; include?: string[] },
): void {
  const { typeRoots, rootDir, outDir } = baseTsConfig.compilerOptions;
  const tsconfigWrapper = JSON.stringify(
    {
      extends: '@wattry/tsconfig/base',
      ...(baseTsConfig.include && { include: baseTsConfig.include }),
      ...(baseTsConfig.exclude && { exclude: baseTsConfig.exclude }),
      compilerOptions: {
        ...(typeRoots !== undefined && { typeRoots }),
        ...(rootDir !== undefined && { rootDir }),
        ...(outDir !== undefined && { outDir }),
      },
    },
    null,
    2,
  );

  const { rootDir: buildRootDir, outDir: buildOutDir } = buildTsConfig.compilerOptions;
  const tsconfigBuildWrapper = JSON.stringify(
    {
      extends: './tsconfig.json',
      ...(buildTsConfig.include && { include: buildTsConfig.include }),
      compilerOptions: {
        ...(buildRootDir !== undefined && { rootDir: buildRootDir }),
        ...(buildOutDir !== undefined && { outDir: buildOutDir }),
      },
    },
    null,
    2,
  );

  logger.info('Writing wrapper configs');
  fs.writeFileSync(path.join(projectDir, 'tsconfig.json'), tsconfigWrapper);
  fs.writeFileSync(path.join(projectDir, 'tsconfig.build.json'), tsconfigBuildWrapper);
  fs.writeFileSync(path.join(projectDir, 'eslint.config.ts'), ESLINT_WRAPPER);
  fs.writeFileSync(path.join(projectDir, 'vitest.config.ts'), VITEST_WRAPPER);
  logger.info('Wrote wrapper configs');
}

export function configurePkgJson(
  projectDir: string,
  basePkgJson: BasePkgJson,
  configs: ConfigMap,
  overwriteScripts = false
): void {
  logger.info('Configure package.json');

  const pkgJson: PkgJson = JSON.parse(
    fs.readFileSync(path.join(projectDir, 'package.json'), encoding).toString(),
  );

  if (!pkgJson.name) throw new ReferenceError('package.json requires a name');

  const newPkgJson: PkgJson = {
    ...pkgJson,
    scripts: overwriteScripts
      ? { ...(pkgJson.scripts ?? {}), ...basePkgJson.scripts }
      : { ...basePkgJson.scripts, ...(pkgJson.scripts ?? {}) },
  };

  if (!pkgJson.type) newPkgJson.type = 'module';
  if (!pkgJson.license) newPkgJson.license = 'Apache-2.0';

  configs.set('package.json', JSON.stringify(newPkgJson, null, 2));
  logger.info('Configured package.json');
}

export function writeConfigs(configs: ConfigMap): void {
  logger.info('Copying configs');
  for (const [config, file] of configs.entries()) {
    try {
      logger.debug('Writing:', config);
      fs.writeFileSync(path.join(process.env?.['PWD'] ?? process.cwd(), config), file);
      logger.debug('Wrote:', config);
    } catch (error: unknown) {
      logger.error((error as Error).message);
    }
  }
  logger.info('Copied configs');
}

export function mkDirectories(name: string): void {
  try {
    fs.mkdirSync(path.join(process.env?.['PWD'] ?? process.cwd(), name));
  } catch (error: unknown) {
    logger.error((error as Error).message);
  }
}

export function rmConfigs(projectDir: string): void {
  logger.info('Removing wrapper configs');
  for (const file of ['tsconfig.json', 'tsconfig.build.json', 'eslint.config.ts', 'vitest.config.ts', '.ts.config.json']) {
    try {
      fs.rmSync(path.join(projectDir, file), rmOptions);
    } catch (error: unknown) {
      logger.error((error as Error).message);
    }
  }
  logger.info('Removed wrapper configs');
}

export default {
  rmOptions,
  encoding,
  writeWrappers,
  configurePkgJson,
  writeConfigs,
  mkDirectories,
  rmConfigs,
};
