import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'node:fs';
import { createManifest, readManifest, writeManifest } from '../src/manifest.js';
import type { Manifest } from '../src/types.js';

vi.mock('node:fs');

const MANIFEST_PATH = '/project/.ts.config.json';

const baseManifest: Manifest = {
  version: '1.0.0',
  snapshots: {
    tsconfig: { compilerOptions: { strict: true } },
    eslint: 'export default [];',
    vitest: 'export default {};',
  },
  overrides: [],
};

describe('readManifest', () => {
  it('returns parsed manifest when file exists', () => {
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(baseManifest));
    const result = readManifest('/project');
    expect(result).toEqual(baseManifest);
  });

  it('throws if manifest does not exist', () => {
    vi.mocked(fs.readFileSync).mockImplementation(() => { throw new Error('ENOENT'); });
    expect(() => readManifest('/project')).toThrow('ENOENT');
  });
});

describe('writeManifest', () => {
  it('writes manifest as formatted JSON', () => {
    const writeSpy = vi.mocked(fs.writeFileSync);
    writeManifest('/project', baseManifest);
    expect(writeSpy).toHaveBeenCalledWith(
      MANIFEST_PATH,
      JSON.stringify(baseManifest, null, 2),
    );
  });
});

describe('createManifest', () => {
  it('returns manifest with provided version and snapshots', () => {
    const snapshots = baseManifest.snapshots;
    const result = createManifest('1.0.0', snapshots);
    expect(result.version).toBe('1.0.0');
    expect(result.snapshots).toEqual(snapshots);
    expect(result.overrides).toEqual([]);
  });
});
