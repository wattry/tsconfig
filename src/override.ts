import { Manifest, Override } from './types.js';

export function addOverride(
  manifest: Manifest,
  config: string,
  key: string,
  reason: string,
): Manifest {
  const exists = manifest.overrides.some((o) => o.config === config && o.key === key);
  if (exists) {
    throw new Error(`Override already exists for ${config}/${key}. Use 'override remove' first.`);
  }

  const newOverride: Override = {
    config,
    key,
    reason,
    addedAt: new Date().toISOString().split('T')[0] ?? '',
  };

  return { ...manifest, overrides: [...manifest.overrides, newOverride] };
}

export function removeOverride(manifest: Manifest, config: string, key: string): Manifest {
  const index = manifest.overrides.findIndex((o) => o.config === config && o.key === key);
  if (index === -1) {
    throw new Error(`No override found for ${config}/${key}.`);
  }

  const overrides = [...manifest.overrides];
  overrides.splice(index, 1);
  return { ...manifest, overrides };
}

export function listOverrides(overrides: Override[]): string {
  if (overrides.length === 0) return 'No overrides registered.';

  const header = 'Config'.padEnd(12) + 'Key'.padEnd(35) + 'Reason'.padEnd(40) + 'Added';
  const rows = overrides.map((o) => o.config.padEnd(12) + o.key.padEnd(35) + o.reason.padEnd(40) + o.addedAt);

  return [header, ...rows].join('\n');
}

export default { addOverride, removeOverride, listOverrides };
