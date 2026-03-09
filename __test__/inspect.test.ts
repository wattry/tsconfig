import { describe, it, expect, vi } from 'vitest';
import fs from 'node:fs';
import { inspectConfigs, formatInspectResult } from '../src/inspect.js';
import type { Manifest } from '../src/types.js';

vi.mock('node:fs');
vi.mock('../src/logger.js', () => ({
  logger: { info: vi.fn(), debug: vi.fn(), error: vi.fn(), warn: vi.fn() },
}));

const packageDir = '/project/node_modules/@wattry/tsconfig';

const manifest: Manifest = {
  version: '1.0.0',
  snapshots: {
    tsconfig: { compilerOptions: { strict: true, target: 'ES2020' } },
    eslint: 'export default [];',
    vitest: 'export default {};',
  },
  overrides: [
    { config: 'tsconfig', key: 'compilerOptions.jsx', reason: 'Next.js', addedAt: '2026-03-09' },
  ],
};

describe('inspectConfigs', () => {
  it('detects added compiler option', () => {
    vi.mocked(fs.readFileSync).mockImplementation((p) => {
      if ((p as string).endsWith('tsconfig.json')) {
        return JSON.stringify({ compilerOptions: { strict: true, target: 'ES2020', noUncheckedIndexedAccess: true } });
      }
      return manifest.snapshots.eslint;
    });

    const result = inspectConfigs(manifest, packageDir);
    expect(result.tsconfig).toContainEqual(
      expect.objectContaining({ type: 'added', key: 'noUncheckedIndexedAccess' })
    );
  });

  it('returns empty diffs when configs unchanged', () => {
    vi.mocked(fs.readFileSync).mockImplementation((p) => {
      if ((p as string).endsWith('tsconfig.json')) {
        return JSON.stringify({ compilerOptions: { strict: true, target: 'ES2020' } });
      }
      if ((p as string).endsWith('eslint.config.js')) return manifest.snapshots.eslint;
      return manifest.snapshots.vitest;
    });

    const result = inspectConfigs(manifest, packageDir);
    expect(result.tsconfig).toHaveLength(0);
    expect(result.eslint).toHaveLength(0);
    expect(result.vitest).toHaveLength(0);
  });
});

describe('formatInspectResult', () => {
  it('outputs "All configs are up to date." when no diffs', () => {
    const output = formatInspectResult({ tsconfig: [], eslint: [], vitest: [] }, []);
    expect(output).toBe('All configs are up to date.');
  });

  it('shows added compiler option with + prefix', () => {
    const output = formatInspectResult(
      { tsconfig: [{ type: 'added', key: 'verbatimModuleSyntax', value: true }], eslint: [], vitest: [] },
      []
    );
    expect(output).toContain('+ compilerOptions.verbatimModuleSyntax');
  });

  it('shows removed compiler option with - prefix', () => {
    const output = formatInspectResult(
      { tsconfig: [{ type: 'removed', key: 'downlevelIteration', value: true }], eslint: [], vitest: [] },
      []
    );
    expect(output).toContain('- compilerOptions.downlevelIteration');
  });

  it('shows changed compiler option with ~ prefix', () => {
    const output = formatInspectResult(
      { tsconfig: [{ type: 'changed', key: 'target', from: 'ES2020', to: 'ES2023' }], eslint: [], vitest: [] },
      []
    );
    expect(output).toContain('~ compilerOptions.target');
  });

  it('shows overrides section when overrides present', () => {
    const output = formatInspectResult({ tsconfig: [], eslint: [], vitest: [] }, manifest.overrides);
    expect(output).toContain('Project overrides');
    expect(output).toContain('compilerOptions.jsx');
    expect(output).toContain('Next.js');
  });
});
