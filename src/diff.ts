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

  const diffs: TextLineDiff[] = [];

  const countLines = (text: string): Map<string, number> => {
    const counts = new Map<string, number>();
    for (const line of text.split('\n')) {
      counts.set(line, (counts.get(line) ?? 0) + 1);
    }
    return counts;
  };

  const beforeCounts = countLines(before);
  const afterCounts = countLines(after);
  const allLines = new Set([...beforeCounts.keys(), ...afterCounts.keys()]);

  for (const line of allLines) {
    const bCount = beforeCounts.get(line) ?? 0;
    const aCount = afterCounts.get(line) ?? 0;
    const removed = bCount - aCount;
    const added = aCount - bCount;
    for (let i = 0; i < removed; i++) diffs.push({ type: 'removed', line });
    for (let i = 0; i < added; i++) diffs.push({ type: 'added', line });
  }

  return diffs;
}

export default { diffCompilerOptions, diffText };
