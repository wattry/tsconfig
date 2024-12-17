import fs, { EncodingOption } from 'node:fs';

export const rmOptions = { recursive: true, force: true };
export const encoding: EncodingOption = { encoding: 'utf8' };

import { tsConfigPath, BasePkgJson, PkgJson, ConfigMap } from './types.ts';

export function configurePkgJson(
  basePkgJson: BasePkgJson,
  cjs: boolean,
  configs: ConfigMap,
) {
  console.info('Configure package.json');

  const pkgJson: PkgJson = JSON.parse(
    fs.readFileSync(`${process.env.PWD}/package.json`, encoding).toString(),
  );
  const newPkgJson: PkgJson = { ...pkgJson };

  if (!pkgJson.name) {
    throw new ReferenceError('package.json requires a name');
  }
  newPkgJson.files = ['dist', 'types'];
  newPkgJson.type = 'module';
  newPkgJson.types = './dist/index.d.ts';
  newPkgJson.module = './dist/index.js';

  if (cjs) {
    newPkgJson.main = './dist/index.cjs';
    newPkgJson.exports = {
      types: './dist/index.d.ts',
      import: './dist/index.js',
      require: './dist/index.cjs',
    };
  } else {
    if (newPkgJson?.main) {
      delete newPkgJson.main;
    }
  }
  newPkgJson.scripts = { ...(pkgJson.scripts ?? {}), ...basePkgJson.scripts };
  newPkgJson.license = 'Apache-2.0';

  configs.set('package.json', JSON.stringify(newPkgJson, null, 2));
  console.info('Configured package.json');
}

export function readConfigs(
  basePkgJson: BasePkgJson,
  cjs: boolean,
  configs: ConfigMap,
) {
  console.info('Reading configs');
  for (const config of basePkgJson.files) {
    if (
      !(config === 'dist/**/*') &&
      !cjs &&
      !(config === 'tsconfig.cjs.json')
    ) {
      try {
        const file = fs
          .readFileSync(`${tsConfigPath}/${config}`, encoding)
          .toString();

        configs.set(config, file);
      } catch (error: unknown) {
        console.error((error as Error).message);
      }
    }
  }
  console.info('Read configs');
}

export function writeConfigs(configs: ConfigMap) {
  console.info('Copying configs');
  for (const [config, file] of configs.entries()) {
    try {
      console.debug('Writing:', config);
      fs.writeFileSync(`${process.env.PWD}/${config}`, file);
      console.debug('Wrote:', config);
    } catch (error: unknown) {
      console.error((error as Error).message);
    }
  }
  console.info('Copied configs');
}

export function mkDirectories(name: string) {
  try {
    fs.mkdirSync(`${process.env.PWD}/${name}`);
  } catch (error: unknown) {
    console.error((error as Error).message);
  }
}

export function rmConfigs(basePkgJson: BasePkgJson) {
  console.info('Removing configs');
  for (const config of basePkgJson.files) {
    try {
      fs.rmSync(`${process.env.PWD}/${config}`, rmOptions);
    } catch (error: unknown) {
      console.error((error as Error).message);
    }
  }
  console.info('Removed configs');
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
