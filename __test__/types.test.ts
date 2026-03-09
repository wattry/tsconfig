import { describe, it, expectTypeOf } from 'vitest';
import type { Manifest, Override, Snapshots, TsConfigSnapshot } from '../src/types.js';

describe('Override type', () => {
  it('has string fields for config, key, reason, addedAt', () => {
    const o: Override = {
      config: 'tsconfig',
      key: 'compilerOptions.jsx',
      reason: 'Next.js',
      addedAt: '2026-03-09',
    };
    expectTypeOf(o.config).toBeString();
    expectTypeOf(o.key).toBeString();
    expectTypeOf(o.reason).toBeString();
    expectTypeOf(o.addedAt).toBeString();
  });
});

describe('TsConfigSnapshot type', () => {
  it('has compilerOptions as Record<string, unknown>', () => {
    const s: TsConfigSnapshot = { compilerOptions: { strict: true } };
    expectTypeOf(s.compilerOptions).toMatchTypeOf<Record<string, unknown>>();
  });
});

describe('Snapshots type', () => {
  it('has tsconfig, eslint, vitest fields', () => {
    const s: Snapshots = {
      tsconfig: { compilerOptions: {} },
      eslint: 'export default [];',
      vitest: 'export default {};',
    };
    expectTypeOf(s.tsconfig).toMatchTypeOf<TsConfigSnapshot>();
    expectTypeOf(s.eslint).toBeString();
    expectTypeOf(s.vitest).toBeString();
  });
});

describe('Manifest type', () => {
  it('has version as string, overrides as Override array', () => {
    const m: Manifest = {
      version: '1.0.0',
      snapshots: { tsconfig: { compilerOptions: {} }, eslint: '', vitest: '' },
      overrides: [],
    };
    expectTypeOf(m.version).toBeString();
    expectTypeOf(m.overrides).toMatchTypeOf<Override[]>();
  });
});
