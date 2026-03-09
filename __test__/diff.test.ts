import { describe, it, expect } from 'vitest';
import { diffCompilerOptions, diffText } from '../src/diff.js';

describe('diffCompilerOptions', () => {
  it('detects added key', () => {
    const result = diffCompilerOptions({ strict: true }, { strict: true, noUncheckedIndexedAccess: true });
    expect(result).toContainEqual({ type: 'added', key: 'noUncheckedIndexedAccess', value: true });
  });

  it('detects removed key', () => {
    const result = diffCompilerOptions({ strict: true, jsx: 'react' }, { strict: true });
    expect(result).toContainEqual({ type: 'removed', key: 'jsx', value: 'react' });
  });

  it('detects changed value', () => {
    const result = diffCompilerOptions({ target: 'ES2020' }, { target: 'ES2023' });
    expect(result).toContainEqual({ type: 'changed', key: 'target', from: 'ES2020', to: 'ES2023' });
  });

  it('returns empty array when equal', () => {
    const result = diffCompilerOptions({ strict: true }, { strict: true });
    expect(result).toHaveLength(0);
  });
});

describe('diffText', () => {
  it('returns added and removed lines', () => {
    const before = 'line1\nline2\nline3';
    const after = 'line1\nline3\nline4';
    const result = diffText(before, after);
    expect(result).toContainEqual({ type: 'removed', line: 'line2' });
    expect(result).toContainEqual({ type: 'added', line: 'line4' });
  });

  it('returns empty array for identical text', () => {
    const result = diffText('abc', 'abc');
    expect(result).toHaveLength(0);
  });

  it('detects duplicate line added', () => {
    const result = diffText('a\nb', 'a\nb\nb');
    expect(result).toContainEqual({ type: 'added', line: 'b' });
    expect(result.filter((d) => d.type === 'added')).toHaveLength(1);
  });

  it('detects duplicate line removed', () => {
    const result = diffText('a\nb\nb', 'a\nb');
    expect(result).toContainEqual({ type: 'removed', line: 'b' });
    expect(result.filter((d) => d.type === 'removed')).toHaveLength(1);
  });
});
