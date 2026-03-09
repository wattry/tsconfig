import { describe, it, expect, vi } from 'vitest';
import fs from 'node:fs';
import { writeWrappers, configurePkgJson } from '../src/files.js';
import type { BasePkgJson, PkgJson } from '../src/types.js';

vi.mock('node:fs');
vi.mock('../src/logger.js', () => ({
  logger: { info: vi.fn(), debug: vi.fn(), error: vi.fn(), warn: vi.fn() },
}));

const projectDir = '/project';

describe('writeWrappers', () => {
  it('writes tsconfig.json with extends pointing to package', () => {
    vi.mocked(fs.writeFileSync).mockReset();
    writeWrappers(projectDir);
    const calls = vi.mocked(fs.writeFileSync).mock.calls;
    const tsconfigCall = calls.find(([p]) => (p as string).endsWith('tsconfig.json'));
    expect(tsconfigCall).toBeDefined();
    const content = JSON.parse(tsconfigCall![1] as string);
    expect(content.extends).toBe('@wattry/tsconfig/tsconfig.json');
    expect(content).toHaveProperty('compilerOptions');
  });

  it('writes eslint.config.js importing from package', () => {
    vi.mocked(fs.writeFileSync).mockReset();
    writeWrappers(projectDir);
    const calls = vi.mocked(fs.writeFileSync).mock.calls;
    const eslintCall = calls.find(([p]) => (p as string).endsWith('eslint.config.js'));
    expect(eslintCall).toBeDefined();
    expect(eslintCall![1] as string).toContain("from '@wattry/tsconfig/eslint.config.js'");
  });

  it('writes vitest.config.js importing from package', () => {
    vi.mocked(fs.writeFileSync).mockReset();
    writeWrappers(projectDir);
    const calls = vi.mocked(fs.writeFileSync).mock.calls;
    const vitestCall = calls.find(([p]) => (p as string).endsWith('vitest.config.js'));
    expect(vitestCall).toBeDefined();
    expect(vitestCall![1] as string).toContain("from '@wattry/tsconfig/vitest.config.js'");
  });

  it('writes exactly 3 files', () => {
    vi.mocked(fs.writeFileSync).mockReset();
    writeWrappers(projectDir);
    expect(vi.mocked(fs.writeFileSync).mock.calls).toHaveLength(3);
  });
});

describe('configurePkgJson', () => {
  it('merges base scripts additively without removing existing ones', () => {
    const existing: PkgJson = { name: 'my-app', scripts: { start: 'node dist/index.js' } };
    const baseScripts = { build: 'tsc', test: 'vitest' };
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(existing));

    const configs = new Map<string, string>();
    configurePkgJson({ scripts: baseScripts } as unknown as BasePkgJson, configs);

    const result: PkgJson = JSON.parse(configs.get('package.json')!);
    expect(result.scripts?.start).toBe('node dist/index.js');
    expect(result.scripts?.build).toBe('tsc');
  });

  it('project scripts take precedence over base scripts on collision', () => {
    const existing: PkgJson = { name: 'my-app', scripts: { test: 'jest' } };
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(existing));

    const configs = new Map<string, string>();
    configurePkgJson({ scripts: { test: 'vitest' } } as unknown as BasePkgJson, configs);

    const result: PkgJson = JSON.parse(configs.get('package.json')!);
    expect(result.scripts?.test).toBe('jest');
  });

  it('does not overwrite existing type field', () => {
    const existing: PkgJson = { name: 'my-app', type: 'commonjs' };
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(existing));
    const configs = new Map<string, string>();
    configurePkgJson({ scripts: {} } as unknown as BasePkgJson, configs);
    const result: PkgJson = JSON.parse(configs.get('package.json')!);
    expect(result.type).toBe('commonjs');
  });

  it('sets type to module when not present', () => {
    const existing: PkgJson = { name: 'my-app' };
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(existing));
    const configs = new Map<string, string>();
    configurePkgJson({ scripts: {} } as unknown as BasePkgJson, configs);
    const result: PkgJson = JSON.parse(configs.get('package.json')!);
    expect(result.type).toBe('module');
  });

  it('throws ReferenceError if package.json has no name', () => {
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({}));
    const configs = new Map<string, string>();
    expect(() => configurePkgJson({ scripts: {} } as unknown as BasePkgJson, configs))
      .toThrow(ReferenceError);
  });
});
