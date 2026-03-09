import fs, { EncodingOption } from 'node:fs';
import path from 'node:path';

import { logger } from './logger.js';
import { BasePkgJson, PkgJson, ConfigMap } from './types.js';

export const rmOptions = { recursive: true, force: true };
export const encoding: EncodingOption = { encoding: 'utf8' };

const TSCONFIG_WRAPPER = JSON.stringify(
  { extends: '@wattry/tsconfig/tsconfig.json', compilerOptions: {} },
  null,
  2,
);

const ESLINT_WRAPPER = `import base from '@wattry/tsconfig/eslint.config.js';

export default [
  ...base,
  {
    // Project-level overrides go here
  },
];
`;

const VITEST_WRAPPER = `import base from '@wattry/tsconfig/vitest.config.js';

export default {
  ...base,
  // Project-level overrides go here
};
`;

export function writeWrappers(projectDir: string): void {
  logger.info('Writing wrapper configs');
  fs.writeFileSync(path.join(projectDir, 'tsconfig.json'), TSCONFIG_WRAPPER);
  fs.writeFileSync(path.join(projectDir, 'eslint.config.js'), ESLINT_WRAPPER);
  fs.writeFileSync(path.join(projectDir, 'vitest.config.js'), VITEST_WRAPPER);
  logger.info('Wrote wrapper configs');
}

export function configurePkgJson(basePkgJson: BasePkgJson, configs: ConfigMap): void {
  logger.info('Configure package.json');

  const pkgJson: PkgJson = JSON.parse(
    fs.readFileSync(path.join(process.env?.['PWD'] ?? process.cwd(), 'package.json'), encoding).toString(),
  );

  if (!pkgJson.name) throw new ReferenceError('package.json requires a name');

  const newPkgJson: PkgJson = {
    ...pkgJson,
    scripts: { ...basePkgJson.scripts, ...(pkgJson.scripts ?? {}) },
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
  for (const file of ['tsconfig.json', 'eslint.config.js', 'vitest.config.js', '.ts.config.json']) {
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
