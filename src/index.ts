#!/usr/bin/env node

import { Command, Option } from 'commander';
import fs from 'node:fs';

import { Logger } from './logger.js';
import files from './files.js';
import dependencies from './dependencies.js';
import * as manifestMod from './manifest.js';
import * as inspectMod from './inspect.js';
import { tsConfigPath, choices, LogLevelOption } from './types.js';
import { BasePkgJson, Options, Snapshots } from './types.js';

const program = new Command();
const basePkgJsonString = fs
  .readFileSync(`${tsConfigPath}/package.json`, files.encoding)
  .toString();
const basePkgJson: BasePkgJson = JSON.parse(basePkgJsonString);

program
  .name(basePkgJson.name)
  .description(basePkgJson.description)
  .version(basePkgJson.version);

const pmOption = new Option(
  '-p, --package-manager <string>',
  'Set a package manager to manage dependencies',
);

const debug = new Option(
  '-d, --debug',
  'Log level debug',
);

const verbose = new Option(
  '--verbose',
  'Log level verbose',
);

pmOption.default(choices[0]);
pmOption.choices(choices);

program
  .command('init')
  .description('Initialize a ts project with the base config for a specific NodeJS version')
  .addOption(pmOption)
  .addOption(debug)
  .addOption(verbose)
  .action(function (options: Options) {
    const level = options?.debug
      ? 'debug'
      : options?.verbose
        ? 'verbose'
        : 'info';

    const logger = Logger(level as LogLevelOption);
    logger.debug('Using options:', options);

    const { packageManager } = options;
    const projectDir = process.env?.['PWD'] ?? process.cwd();

    // Make src & types directories
    files.mkDirectories('src');
    files.mkDirectories('types');

    // Write thin wrapper config files
    files.writeWrappers(projectDir);

    // Merge package.json additively
    const configs = new Map<string, string>();
    files.configurePkgJson(projectDir, basePkgJson, configs);
    files.writeConfigs(configs);

    // Install required dev dependencies
    dependencies.installDev(basePkgJson, packageManager);

    // Capture base config snapshots from the installed package
    const tsconfigRaw = fs.readFileSync(`${tsConfigPath}/tsconfig.json`, files.encoding).toString();
    const tsconfigParsed: { compilerOptions: Record<string, unknown> } = JSON.parse(tsconfigRaw);

    const eslintRaw = fs.readFileSync(`${tsConfigPath}/eslint.config.js`, files.encoding).toString();
    const vitestRaw = fs.readFileSync(`${tsConfigPath}/vitest.config.js`, files.encoding).toString();

    const snapshots: Snapshots = {
      tsconfig: { compilerOptions: tsconfigParsed.compilerOptions },
      eslint: eslintRaw,
      vitest: vitestRaw,
    };

    // Create and write the manifest
    const manifest = manifestMod.createManifest(basePkgJson.version, snapshots);
    manifestMod.writeManifest(projectDir, manifest);

    logger.info('Initialized configuration');
  });

program
  .command('reset')
  .description('Remove the TS configs added by this program')
  .addOption(pmOption)
  .addOption(debug)
  .addOption(verbose)
  .action(function (options: Options) {
    const level = options?.debug
      ? 'debug'
      : options?.verbose
        ? 'verbose'
        : 'info';

    const logger = Logger(level as LogLevelOption);

    logger.debug('Using options:', options);

    const { packageManager } = options;
    const projectDir = process.env?.['PWD'] ?? process.cwd();

    // Uninstall dev dependencies
    dependencies.uninstallDev(basePkgJson, packageManager);

    // Remove wrapper files and manifest
    files.rmConfigs(projectDir);

    logger.info('Package reset');
  });

program
  .command('inspect')
  .description('Show diff between pinned base config version and currently installed version')
  .addOption(debug)
  .addOption(verbose)
  .action(function (options: Options) {
    const level = options?.debug ? 'debug' : options?.verbose ? 'verbose' : 'info';
    const logger = Logger(level as LogLevelOption);

    const projectDir = process.env?.['PWD'] ?? process.cwd();
    const packageDir = tsConfigPath;

    const currentManifest = manifestMod.readManifest(projectDir);
    const result = inspectMod.inspectConfigs(currentManifest, packageDir);
    const output = inspectMod.formatInspectResult(result, currentManifest.overrides);

    logger.info(output);
  });

program.parse();
