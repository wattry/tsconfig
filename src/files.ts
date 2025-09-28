import fs, { EncodingOption } from 'node:fs';

import { logger } from './logger.js';

export const rmOptions = { recursive: true, force: true };
export const encoding: EncodingOption = { encoding: 'utf8' };

import { tsConfigPath, BasePkgJson, PkgJson, ConfigMap } from './types.js';

export function configurePkgJson(
  basePkgJson: BasePkgJson,
  configs: ConfigMap
) {
  logger.info('Configure package.json');

  const pkgJson: PkgJson = JSON.parse(
    fs.readFileSync(`${process.env?.['PWD']}/package.json`, encoding).toString(),
  );
  const newPkgJson: PkgJson = { ...pkgJson };

  if (!pkgJson.name) {
    throw new ReferenceError('package.json requires a name');
  }
  newPkgJson.files = ['dist', 'types'];
  newPkgJson.type = 'module';
  newPkgJson.types = './dist/index.d.ts';
  newPkgJson.module = './dist/index.js';
  newPkgJson.scripts = { ...(pkgJson.scripts ?? {}), ...basePkgJson.scripts };
  newPkgJson.license = 'Apache-2.0';

  configs.set('package.json', JSON.stringify(newPkgJson, null, 2));
  logger.info('Configured package.json');
}

export function readConfigs(
  basePkgJson: BasePkgJson,
  configs: ConfigMap,
) {
  logger.info('Reading configs');
  for (const config of basePkgJson.files) {
    if (
      !(config === 'dist/**/*')
    ) {
      try {
        const file = fs
          .readFileSync(`${tsConfigPath}/${config}`, encoding)
          .toString();

        configs.set(config, file);
      } catch (error: unknown) {
        logger.error((error as Error).message);
      }
    }
  }
  logger.info('Read configs');
}

export function writeConfigs(configs: ConfigMap) {
  logger.info('Copying configs');
  for (const [config, file] of configs.entries()) {
    try {
      logger.debug('Writing:', config);
      fs.writeFileSync(`${process.env?.['PWD']}/${config}`, file);
      logger.debug('Wrote:', config);
    } catch (error: unknown) {
      logger.error((error as Error).message);
    }
  }
  logger.info('Copied configs');
}

export function mkDirectories(name: string) {
  try {
    fs.mkdirSync(`${process.env?.['PWD']}/${name}`);
  } catch (error: unknown) {
    logger.error((error as Error).message);
  }
}

export function rmConfigs(basePkgJson: BasePkgJson) {
  logger.info('Removing configs');
  for (const config of basePkgJson.files) {
    try {
      fs.rmSync(`${process.env?.['PWD']}/${config}`, rmOptions);
    } catch (error: unknown) {
      logger.error((error as Error).message);
    }
  }
  logger.info('Removed configs');
}

export default {
  rmOptions,
  encoding,
  configurePkgJson,
  readConfigs,
  writeConfigs,
  mkDirectories,
  rmConfigs,
};
