import { describe, it, expectTypeOf } from 'vitest';
import type { Manifest, Override } from '../src/types.js';

describe('Manifest types', () => {
  it('Override has required fields', () => {
    const o: Override = {
      config: 'tsconfig',
      key: 'compilerOptions.jsx',
      reason: 'Next.js',
      addedAt: '2026-03-09',
    };
    expectTypeOf(o).toMatchTypeOf<Override>();
  });

  it('Manifest has version, snapshots, overrides', () => {
    const m: Manifest = {
      version: '1.0.0',
      snapshots: {
        tsconfig: { compilerOptions: {} },
        eslint: '',
        vitest: '',
      },
      overrides: [],
    };
    expectTypeOf(m).toMatchTypeOf<Manifest>();
  });
});
