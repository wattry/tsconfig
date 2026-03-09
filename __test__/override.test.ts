import { describe, it, expect } from 'vitest';
import { addOverride, removeOverride, listOverrides } from '../src/override.js';
import type { Manifest, Override } from '../src/types.js';

const base: Manifest = {
  version: '1.0.0',
  snapshots: { tsconfig: { compilerOptions: {} }, eslint: '', vitest: '' },
  overrides: [],
};

const existingOverride: Override = {
  config: 'tsconfig',
  key: 'compilerOptions.jsx',
  reason: 'Next.js',
  addedAt: '2026-03-09',
};

describe('addOverride', () => {
  it('adds a new override entry', () => {
    const result = addOverride(base, 'tsconfig', 'compilerOptions.jsx', 'Next.js');
    expect(result.overrides).toHaveLength(1);
    expect(result.overrides[0]?.key).toBe('compilerOptions.jsx');
    expect(result.overrides[0]?.reason).toBe('Next.js');
    expect(result.overrides[0]?.config).toBe('tsconfig');
    expect(result.overrides[0]?.addedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('does not mutate the original manifest', () => {
    addOverride(base, 'tsconfig', 'compilerOptions.jsx', 'Next.js');
    expect(base.overrides).toHaveLength(0);
  });

  it('throws if override already exists for same config+key', () => {
    const withOverride = { ...base, overrides: [existingOverride] };
    expect(() => addOverride(withOverride, 'tsconfig', 'compilerOptions.jsx', 'duplicate')).toThrow();
  });

  it('allows same key in different configs', () => {
    const withOverride = { ...base, overrides: [existingOverride] };
    expect(() => addOverride(withOverride, 'eslint', 'compilerOptions.jsx', 'different config')).not.toThrow();
  });
});

describe('removeOverride', () => {
  it('removes matching override', () => {
    const withOverride = { ...base, overrides: [existingOverride] };
    const result = removeOverride(withOverride, 'tsconfig', 'compilerOptions.jsx');
    expect(result.overrides).toHaveLength(0);
  });

  it('does not mutate the original manifest', () => {
    const withOverride = { ...base, overrides: [existingOverride] };
    removeOverride(withOverride, 'tsconfig', 'compilerOptions.jsx');
    expect(withOverride.overrides).toHaveLength(1);
  });

  it('throws if override not found', () => {
    expect(() => removeOverride(base, 'tsconfig', 'nonexistent')).toThrow();
  });

  it('only removes the matching config+key, not others', () => {
    const anotherOverride: Override = { ...existingOverride, key: 'compilerOptions.target' };
    const withTwo = { ...base, overrides: [existingOverride, anotherOverride] };
    const result = removeOverride(withTwo, 'tsconfig', 'compilerOptions.jsx');
    expect(result.overrides).toHaveLength(1);
    expect(result.overrides[0]?.key).toBe('compilerOptions.target');
  });
});

describe('listOverrides', () => {
  it('returns "No overrides registered." when empty', () => {
    const output = listOverrides([]);
    expect(output).toBe('No overrides registered.');
  });

  it('includes config, key, reason, and date in output', () => {
    const output = listOverrides([existingOverride]);
    expect(output).toContain('tsconfig');
    expect(output).toContain('compilerOptions.jsx');
    expect(output).toContain('Next.js');
    expect(output).toContain('2026-03-09');
  });

  it('includes a header row', () => {
    const output = listOverrides([existingOverride]);
    expect(output).toContain('Config');
    expect(output).toContain('Key');
    expect(output).toContain('Reason');
    expect(output).toContain('Added');
  });
});
