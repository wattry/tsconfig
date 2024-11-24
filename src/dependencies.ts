import child from 'node:child_process';

import { Options, BasePkgJson } from './types.ts';

export function installDev(
  basePkgJson: BasePkgJson,
  packageManager: Options['packageManager'],
) {
  const installCmd = packageManager === 'npm' ? 'install -D' : 'add -D';
  const devDependencies = Object.entries(basePkgJson.devDependencies);
  const packages = devDependencies
    .map(([pkg, version]: [pkg: string, version: string]) => `${pkg}@${version}`)
    .join(' ');
  const installCMD = `${packageManager} ${installCmd} ${packages}`;

  console.info('Installing dev dependencies:', installCMD);
  child.execSync(installCMD);
  console.info('Installed dev dependencies');
}

export function uninstallDev(
  basePkgJson: BasePkgJson,
  packageManager: Options['packageManager']
) {
  try {
    const uninstallCmd = packageManager === 'npm' ? 'uninstall' : 'remove';

    // Remove dev dependencies
    const packages = Object
      .keys(basePkgJson.devDependencies)
      .map((pkg: string) => pkg.toString())
    const uninstallCMD = `${packageManager} ${uninstallCmd} ${packages.join(' ')}`;

    console.info('Removing dependencies:', uninstallCMD);
    child.execSync(uninstallCMD);
    console.info('Removed dependencies');
  } catch (error: unknown) {
    console.warn((error as Error).message);
  }
}

export default {
  installDev,
  uninstallDev
};
