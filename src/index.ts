#!/usr/bin/env node

import { Command, Option } from 'commander';
import fs, { EncodingOption } from 'node:fs';
import child from 'child_process';

const rmOptions = { force: true };
const encoding: EncodingOption = { encoding: 'utf8' };

const program = new Command();

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
};
const baseDir = 'node_modules/@wattry/tsconfig';
const tsConfigPath = `${process.env.PWD}/${baseDir}`;
const basePkgJson: BasePkgJson = JSON.parse(fs.readFileSync(`${tsConfigPath}/package.json`, encoding).toString());

program.name(basePkgJson.name)
  .description(basePkgJson.description)
  .version(basePkgJson.version);
const pmOption = new Option('-p, --package-manager <string>', 'Set a package manager to manage dependencies');
const choices = ['pnpm', 'npm', 'yarn'] as const;
pmOption.default(choices[0]);
pmOption.choices(choices);
const cjsOption = new Option('-c, --cjs', 'Include cjs typescript build configuration for dual builds');

/**
 * Allows have optional props coming in from the projects package.json
 */
export type PkgJson = Partial<BasePkgJson>;

interface Options {
  packageManager: typeof choices[number];
  cjs: boolean;
}

/**
 * Writes the CJS config files if the -c or --cjs options is provided.
 */
function writeCJS() {
  const tsconfigCjsJson = fs.readFileSync(`${tsConfigPath}/tsconfig.cjs.json`, encoding);

  fs.writeFileSync(`${process.env.PWD}/tsconfig.cjs.json`, tsconfigCjsJson);
}

program
  .command('init')
  .description('Initialize a ts project with the base config for a specific NodeJS version')
  .addOption(pmOption)
  .addOption(cjsOption)
  .action(function (options: Options) {
    console.warn('Using options:', options);

    const { packageManager, cjs } = options;
    const installCmd = packageManager === 'npm' ? 'install -D' : 'add -D';
    const lintFile = 'eslint.config.js';
    const lintFileLocation = `${tsConfigPath}/${lintFile}`;
    console.warn('Creating eslint.config file:', lintFileLocation);
    const config = fs.readFileSync(lintFileLocation, encoding);
    const ignoreFile = fs.readFileSync(`${tsConfigPath}/.gitignore`, encoding);
    const license = fs.readFileSync(`${tsConfigPath}/LICENSE`, encoding);
    const jestConfig = fs.readFileSync(
      `${tsConfigPath}/jest.config.js`,
      encoding
    );
    const tsconfigJson = fs.readFileSync(
      `${tsConfigPath}/tsconfig.json`,
      encoding
    );
    const devDependencies = Object.entries(basePkgJson.devDependencies);
    const packages = devDependencies.map(([pkg, version]: [pkg: string, version: string]) => `${pkg}@${version}`);
    console.warn('Installing dev dependencies:', packages);
    child.execSync(`${packageManager} ${installCmd} ${packages.join(' ')}`);
    console.warn('Installed dev dependencies');

    const pkgJson: PkgJson = JSON.parse(fs.readFileSync(`${process.env.PWD}/package.json`, encoding).toString());
    const newPkgJson: Partial<BasePkgJson> = { ...pkgJson };

    if (!pkgJson.name) {
      throw new ReferenceError('package.json requires a name');
    }

    newPkgJson.files = ['dist'];
    newPkgJson.type = 'module';
    newPkgJson.types = './dist/index.d.ts';
    if (cjs) {
      writeCJS();
      newPkgJson.main = './dist/index.cjs';
    }
    newPkgJson.exports = cjs ? {
      '.': {
        'types': './dist/index.d.ts',
        'require': './dist/index.cjs',
        'import': './dist/index.js'
      }
    } : {
      'types': './dist/index.d.ts',
      'import': './dist/index.js'
    };
    newPkgJson.module = './dist/index.js';
    newPkgJson.scripts = { ...pkgJson.scripts ?? {}, ...basePkgJson.scripts };
    newPkgJson.license = 'Apache-2.0';
    console.warn('Initializing configuration');
    // Make src directory
    try {
      fs.mkdirSync(`${process.env.PWD}/src`);
    } catch (error: unknown) {
      console.warn((error as Error).message);
    }

    try {
      fs.mkdirSync(`${process.env.PWD}/types`);
    } catch (error: unknown) {
      console.warn((error as Error).message);
    }
    // Create config files
    fs.writeFileSync(`${process.env.PWD}/package.json`, JSON.stringify(newPkgJson, null, 2));
    fs.writeFileSync(`${process.env.PWD}/${lintFile}`, config);
    fs.writeFileSync(`${process.env.PWD}/tsconfig.json`, tsconfigJson);
    fs.writeFileSync(`${process.env.PWD}/LICENSE`, license);
    fs.writeFileSync(`${process.env.PWD}/jest.config.js`, jestConfig);
    fs.writeFileSync(`${process.env.PWD}/.gitignore`, ignoreFile);
    fs.writeFileSync(`${process.env.PWD}/README.md`, `# ${pkgJson.name}`);
    console.warn('Initialized configuration');
  });

program
  .command('reset')
  .description('Remove the TS configs added by this programs')
  .addOption(pmOption)
  .action(function (options: Options) {
    console.warn('Using options:', options);

    const { packageManager } = options;
    const uninstallCmd = packageManager === 'npm' ? 'uninstall -D' : 'remove -D';
    if (process.env.PWD) {
      const pkgJson = JSON.parse(
        fs.readFileSync(`${process.env.PWD}/package.json`, { encoding: 'utf-8' })
      ) as PkgJson;

      // Remove dev dependencies
      if (pkgJson.devDependencies) {
        const baseDevDependencies = Object.keys(basePkgJson.devDependencies);
        const packages = baseDevDependencies.map((pkg: string) => pkg);
        console.warn('Removing dependencies:', packages);
        child.execSync(`${packageManager} ${uninstallCmd} ${packages.join(' ')}`);
        console.warn('Removed dependencies');
      }

      delete pkgJson.main;
      delete pkgJson.module;
      delete pkgJson.types;
      delete pkgJson.exports;
      pkgJson.scripts = {};
      pkgJson.files = [];

      // Update the package.json
      fs.writeFileSync(`${process.env.PWD}/package.json`, JSON.stringify(pkgJson, null, 2));

      fs.rmSync(`${process.env.PWD}/tsconfig.json`, rmOptions);
      fs.rmSync(`${process.env.PWD}/tsconfig.cjs.json`, rmOptions);
      fs.rmSync(`${process.env.PWD}/.gitignore`, rmOptions);
      fs.rmSync(`${process.env.PWD}/LICENSE`, rmOptions);
      fs.rmSync(`${process.env.PWD}/jest.config.js`, rmOptions);
      fs.rmSync(`${process.env.PWD}/eslint.config.js`, rmOptions);
      fs.rmSync(`${process.env.PWD}/node_modules`, { ...rmOptions, recursive: true });
    } else {
      throw new ReferenceError('process.env.PWD is required to remove configuration');
    }
  });

program.parse();
