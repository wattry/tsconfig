#!/usr/bin/env node

import { Command, Option } from 'commander';
import fs from 'node:fs';

import files from './files.ts';
import dependencies from './dependencies.ts';
import { tsConfigPath, choices } from './types.ts';
import { BasePkgJson, PkgJson, Options } from './types.ts';

const program = new Command();
const basePkgJsonString = fs.readFileSync(`${tsConfigPath}/package.json`, files.encoding).toString();
const basePkgJson: BasePkgJson = JSON.parse(basePkgJsonString);

program
  .name(basePkgJson.name)
  .description(basePkgJson.description)
  .version(basePkgJson.version);

const pmOption = new Option('-p, --package-manager <string>', 'Set a package manager to manage dependencies');
const cjsOption = new Option('-c, --cjs', 'Include cjs typescript build configuration for dual builds');

pmOption.default(choices[0]);
pmOption.choices(choices);

program
  .command('init')
  .description('Initialize a ts project with the base config for a specific NodeJS version')
  .addOption(pmOption)
  .addOption(cjsOption)
  .action(function (options: Options) {
    console.info('Using options:', options);

    const { packageManager, cjs } = options;
    // Install required dev dependencies
    dependencies.installDev(basePkgJson, packageManager);
    // Make src & types directories
    files.mkDirectories('src');
    files.mkDirectories('types');

    const configs = new Map<string, string>();
    // Copy config files into project
    files.readConfigs(basePkgJson, cjs, configs);
    files.configurePkgJson(basePkgJson, cjs, configs);
    files.writeConfigs(configs);

    console.info('Initialized configuration');
  });

program
  .command('reset')
  .description('Remove the TS configs added by this programs')
  .addOption(pmOption)
  .action(function (options: Options) {
    console.info('Using options:', options);

    const { packageManager } = options;
    const removePkgJson = `${process.env.PWD}/package.json`;
    const pkgJsonString = fs.readFileSync(removePkgJson, files.encoding).toString();
    const pkgJson: PkgJson = JSON.parse(pkgJsonString);

    dependencies.uninstallDev(basePkgJson, packageManager);
    files.rmConfigs(basePkgJson);

    delete pkgJson.main;
    delete pkgJson.module;
    delete pkgJson.types;
    delete pkgJson.exports;
    delete pkgJson.type;
    delete pkgJson.scripts;
    delete pkgJson.files;
    delete pkgJson.license;

    if (pkgJson.devDependencies) {
      Object.keys(pkgJson.devDependencies).forEach((pkg: string) => {
        if (pkgJson.devDependencies?.[pkg]) {
          delete pkgJson.devDependencies[pkg];
        }
      });
    }

    fs.writeFileSync(removePkgJson, JSON.stringify(pkgJson, null, 2));
    console.info('Package reset');
  });

program.parse();
