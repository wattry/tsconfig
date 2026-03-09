import fs from 'node:fs';
import path from 'node:path';
import { encoding } from './files.js';
import { Manifest, Snapshots } from './types.js';

const MANIFEST_FILE = '.ts.config.json';

export function readManifest(projectDir: string): Manifest {
  const content = fs.readFileSync(path.join(projectDir, MANIFEST_FILE), encoding);
  return JSON.parse(content as string) as Manifest;
}

export function writeManifest(projectDir: string, manifest: Manifest): void {
  fs.writeFileSync(
    path.join(projectDir, MANIFEST_FILE),
    JSON.stringify(manifest, null, 2),
  );
}

export function createManifest(version: string, snapshots: Snapshots): Manifest {
  return { version, snapshots, overrides: [] };
}

export default { readManifest, writeManifest, createManifest };
