import { describe, it, expect, vi } from 'vitest';
import child from 'node:child_process';
import { updatePackage } from '../src/dependencies.js';

vi.mock('node:child_process');
vi.mock('../src/logger.js', () => ({
  logger: { info: vi.fn(), debug: vi.fn(), error: vi.fn(), warn: vi.fn() },
}));

describe('updatePackage', () => {
  it('runs version-pinned install with pnpm', () => {
    vi.mocked(child.execSync).mockReturnValue(Buffer.from(''));
    updatePackage('pnpm', '2.0.0');
    expect(child.execSync).toHaveBeenCalledWith('pnpm add -D @wattry/tsconfig@2.0.0');
  });

  it('runs version-pinned install with npm', () => {
    vi.mocked(child.execSync).mockReturnValue(Buffer.from(''));
    updatePackage('npm', '2.0.0');
    expect(child.execSync).toHaveBeenCalledWith('npm install -D @wattry/tsconfig@2.0.0');
  });

  it('runs version-pinned install with yarn', () => {
    vi.mocked(child.execSync).mockReturnValue(Buffer.from(''));
    updatePackage('yarn', '2.0.0');
    expect(child.execSync).toHaveBeenCalledWith('yarn add -D @wattry/tsconfig@2.0.0');
  });

  it('runs latest install when no version specified', () => {
    vi.mocked(child.execSync).mockReturnValue(Buffer.from(''));
    updatePackage('pnpm');
    expect(child.execSync).toHaveBeenCalledWith('pnpm add -D @wattry/tsconfig@latest');
  });
});
