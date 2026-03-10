import fs from 'node:fs';
import path from 'node:path';
import type { CompilerOptionDiff, TextLineDiff } from './diff.js';
import { diffCompilerOptions, diffText } from './diff.js';
import type { Manifest } from './types.js';
import { encoding } from './files.js';

export interface InspectResult {
  tsconfig: CompilerOptionDiff[];
  eslint: TextLineDiff[];
  vitest: TextLineDiff[];
}

function readOrEmpty(filePath: string): string {
  try {
    return fs.readFileSync(filePath, encoding).toString();
  } catch {
    return '';
  }
}

export function inspectConfigs(manifest: Manifest, packageDir: string): InspectResult {
  const currentTsConfig = JSON.parse(
    fs.readFileSync(path.join(packageDir, 'tsconfig.json'), encoding).toString()
  ) as { compilerOptions?: Record<string, unknown> };

  const currentEslint = readOrEmpty(path.join(packageDir, 'eslint.config.js'));
  const currentVitest = readOrEmpty(path.join(packageDir, 'vitest.config.js'));

  return {
    tsconfig: diffCompilerOptions(
      manifest.snapshots.tsconfig.compilerOptions,
      currentTsConfig.compilerOptions ?? {},
    ),
    eslint: diffText(manifest.snapshots.eslint, currentEslint),
    vitest: diffText(manifest.snapshots.vitest, currentVitest),
  };
}

export function formatInspectResult(result: InspectResult, overrides: Manifest['overrides']): string {
  const lines: string[] = [];

  if (result.tsconfig.length > 0) {
    lines.push('tsconfig.json');
    for (const diff of result.tsconfig) {
      if (diff.type === 'added') {
        lines.push(`  + compilerOptions.${diff.key}: ${JSON.stringify(diff.value)}`);
      } else if (diff.type === 'removed') {
        lines.push(`  - compilerOptions.${diff.key}: ${JSON.stringify(diff.value)}`);
      } else {
        lines.push(`  ~ compilerOptions.${diff.key}: ${JSON.stringify(diff.from)} → ${JSON.stringify(diff.to)}`);
      }
    }
  }

  if (result.eslint.length > 0) {
    lines.push('eslint.config.js');
    for (const diff of result.eslint) {
      lines.push(`  ${diff.type === 'added' ? '+' : '-'} ${diff.line}`);
    }
  }

  if (result.vitest.length > 0) {
    lines.push('vitest.config.js');
    for (const diff of result.vitest) {
      lines.push(`  ${diff.type === 'added' ? '+' : '-'} ${diff.line}`);
    }
  }

  if (overrides.length > 0) {
    if (lines.length > 0) lines.push('');
    lines.push('Project overrides (.ts.config.json):');
    for (const o of overrides) {
      lines.push(`  ${o.config} / ${o.key}  (reason: ${o.reason})`);
    }
  }

  if (lines.length === 0) return 'All configs are up to date.';

  return lines.join('\n');
}

export default { inspectConfigs, formatInspectResult };
