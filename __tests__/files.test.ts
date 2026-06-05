import { describe, it, expect, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { writeWrappers, configurePkgJson, rmConfigs } from '../src/files.js';
import type { BasePkgJson, PkgJson } from '../src/types.js';

vi.mock('node:fs');
vi.mock('../src/logger.js', () => ({
  logger: { info: vi.fn(), debug: vi.fn(), error: vi.fn(), warn: vi.fn() },
}));

const projectDir = '/project';

describe('writeWrappers', () => {
  it('writes tsconfig.json with extends pointing to package', () => {
    vi.mocked(fs.writeFileSync).mockReset();
    writeWrappers(projectDir, { compilerOptions: {} }, { compilerOptions: {} });
    const calls = vi.mocked(fs.writeFileSync).mock.calls;
    const tsconfigCall = calls.find(([p]: [unknown, ...unknown[]]) => (p as string).endsWith('tsconfig.json'));
    expect(tsconfigCall).toBeDefined();
    const content = JSON.parse(tsconfigCall![1] as string);
    expect(content.extends).toBe('@wattry/tsconfig/base');
    expect(content).toHaveProperty('compilerOptions');
  });

  it('writes eslint.config.ts importing from package', () => {
    vi.mocked(fs.writeFileSync).mockReset();
    writeWrappers(projectDir, { compilerOptions: {} }, { compilerOptions: {} });
    const calls = vi.mocked(fs.writeFileSync).mock.calls;
    const eslintCall = calls.find(([p]: [unknown, ...unknown[]]) => (p as string).endsWith('eslint.config.ts'));
    expect(eslintCall).toBeDefined();
    expect(eslintCall![1] as string).toContain("from '@wattry/tsconfig/eslint'");
  });

  it('writes vitest.config.ts importing from package', () => {
    vi.mocked(fs.writeFileSync).mockReset();
    writeWrappers(projectDir, { compilerOptions: {} }, { compilerOptions: {} });
    const calls = vi.mocked(fs.writeFileSync).mock.calls;
    const vitestCall = calls.find(([p]: [unknown, ...unknown[]]) => (p as string).endsWith('vitest.config.ts'));
    expect(vitestCall).toBeDefined();
    expect(vitestCall![1] as string).toContain("from '@wattry/tsconfig/vitest'");
  });

  it('writes tsconfig.build.json extending the local tsconfig.json', () => {
    vi.mocked(fs.writeFileSync).mockReset();
    writeWrappers(projectDir, { compilerOptions: {} }, { compilerOptions: { rootDir: './src', outDir: './dist' }, include: ['src'] });
    const calls = vi.mocked(fs.writeFileSync).mock.calls;
    const buildCall = calls.find(([p]: [unknown, ...unknown[]]) => (p as string).endsWith('tsconfig.build.json'));
    expect(buildCall).toBeDefined();
    const content = JSON.parse(buildCall![1] as string);
    expect(content.extends).toBe('./tsconfig.json');
    expect(content.compilerOptions.rootDir).toBe('./src');
    expect(content.compilerOptions.outDir).toBe('./dist');
  });

  it('writes exactly 4 files', () => {
    vi.mocked(fs.writeFileSync).mockReset();
    writeWrappers(projectDir, { compilerOptions: {} }, { compilerOptions: {} });
    expect(vi.mocked(fs.writeFileSync).mock.calls).toHaveLength(4);
  });
});

describe('configurePkgJson', () => {
  it('merges base scripts additively without removing existing ones', () => {
    const existing: PkgJson = { name: 'my-app', scripts: { start: 'node dist/index.js' } };
    const baseScripts = { build: 'tsc', test: 'vitest' };
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(existing));

    const configs = new Map<string, string>();
    configurePkgJson(projectDir, { scripts: baseScripts } as unknown as BasePkgJson, configs);

    const result: PkgJson = JSON.parse(configs.get('package.json')!);
    expect(result.scripts?.['start']).toBe('node dist/index.js');
    expect(result.scripts?.['build']).toBe('tsc');
  });

  it('project scripts take precedence over base scripts on collision', () => {
    const existing: PkgJson = { name: 'my-app', scripts: { test: 'jest' } };
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(existing));

    const configs = new Map<string, string>();
    configurePkgJson(projectDir, { scripts: { test: 'vitest' } } as unknown as BasePkgJson, configs);

    const result: PkgJson = JSON.parse(configs.get('package.json')!);
    expect(result.scripts?.['test']).toBe('jest');
  });

  it('does not overwrite existing type field', () => {
    const existing: PkgJson = { name: 'my-app', type: 'commonjs' };
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(existing));
    const configs = new Map<string, string>();
    configurePkgJson(projectDir, { scripts: {} } as unknown as BasePkgJson, configs);
    const result: PkgJson = JSON.parse(configs.get('package.json')!);
    expect(result.type).toBe('commonjs');
  });

  it('sets type to module when not present', () => {
    const existing: PkgJson = { name: 'my-app' };
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(existing));
    const configs = new Map<string, string>();
    configurePkgJson(projectDir, { scripts: {} } as unknown as BasePkgJson, configs);
    const result: PkgJson = JSON.parse(configs.get('package.json')!);
    expect(result.type).toBe('module');
  });

  it('throws ReferenceError if package.json has no name', () => {
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({}));
    const configs = new Map<string, string>();
    expect(() => configurePkgJson(projectDir, { scripts: {} } as unknown as BasePkgJson, configs))
      .toThrow(ReferenceError);
  });

  it('sets license to Apache-2.0 when not present', () => {
    const existing: PkgJson = { name: 'my-app' };
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(existing));
    const configs = new Map<string, string>();
    configurePkgJson(projectDir, { scripts: {} } as unknown as BasePkgJson, configs);
    const result: PkgJson = JSON.parse(configs.get('package.json')!);
    expect(result.license).toBe('Apache-2.0');
  });

  it('does not overwrite existing license field', () => {
    const existing: PkgJson = { name: 'my-app', license: 'MIT' };
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(existing));
    const configs = new Map<string, string>();
    configurePkgJson(projectDir, { scripts: {} } as unknown as BasePkgJson, configs);
    const result: PkgJson = JSON.parse(configs.get('package.json')!);
    expect(result.license).toBe('MIT');
  });
});

describe('rmConfigs', () => {
  it('removes all wrapper files from projectDir', () => {
    vi.mocked(fs.rmSync).mockReset();
    rmConfigs(projectDir);
    const removedFiles = vi.mocked(fs.rmSync).mock.calls.map(([p]: [unknown, ...unknown[]]) => path.basename(p as string));
    expect(removedFiles).toContain('tsconfig.json');
    expect(removedFiles).toContain('tsconfig.build.json');
    expect(removedFiles).toContain('eslint.config.ts');
    expect(removedFiles).toContain('vitest.config.ts');
    expect(removedFiles).toContain('.ts.config.json');
  });

  it('removes exactly 5 files', () => {
    vi.mocked(fs.rmSync).mockReset();
    rmConfigs(projectDir);
    expect(vi.mocked(fs.rmSync).mock.calls).toHaveLength(5);
  });
});
