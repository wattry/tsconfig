export type CompilerOptionDiff =
  { type: 'added'; key: string; value: unknown } |
  { type: 'removed'; key: string; value: unknown } |
  { type: 'changed'; key: string; from: unknown; to: unknown };

export type TextLineDiff =
  { type: 'added'; line: string } |
  { type: 'removed'; line: string };

export function diffCompilerOptions(
  before: Record<string, unknown>,
  after: Record<string, unknown>,
): CompilerOptionDiff[] {
  const diffs: CompilerOptionDiff[] = [];
  const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);

  for (const key of allKeys) {
    if (!(key in before)) {
      diffs.push({ type: 'added', key, value: after[key] });
    } else if (!(key in after)) {
      diffs.push({ type: 'removed', key, value: before[key] });
    } else if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
      diffs.push({ type: 'changed', key, from: before[key], to: after[key] });
    }
  }

  return diffs;
}

export function diffText(before: string, after: string): TextLineDiff[] {
  if (before === after) return [];

  const beforeLines = new Set(before.split('\n'));
  const afterLines = new Set(after.split('\n'));
  const diffs: TextLineDiff[] = [];

  for (const line of beforeLines) {
    if (!afterLines.has(line)) diffs.push({ type: 'removed', line });
  }
  for (const line of afterLines) {
    if (!beforeLines.has(line)) diffs.push({ type: 'added', line });
  }

  return diffs;
}

export default { diffCompilerOptions, diffText };
