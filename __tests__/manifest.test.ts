import { describe, it, expect, vi } from 'vitest';
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

  it('throws SyntaxError if file contains invalid JSON', () => {
    vi.mocked(fs.readFileSync).mockReturnValue('not valid json{{{');
    expect(() => readManifest('/project')).toThrow(SyntaxError);
  });
});

describe('writeManifest', () => {
  it('writes manifest as formatted JSON', () => {
    const writeSpy = vi.mocked(fs.writeFileSync);
    writeManifest('/project', baseManifest);
    const expectedJson = '{\n  "version": "1.0.0",\n  "snapshots": {\n    "tsconfig": {\n      "compilerOptions": {\n        "strict": true\n      }\n    },\n    "eslint": "export default [];",\n    "vitest": "export default {};"\n  },\n  "overrides": []\n}';
    expect(writeSpy).toHaveBeenCalledWith(MANIFEST_PATH, expectedJson);
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
