# @wattry/tsconfig

Shared TypeScript, ESLint, and Vitest configuration for ESM projects — plus a `tsconfig` CLI that scaffolds and maintains those configs in your project.

It plays two roles:

1. A **config package** you extend, via the package `exports`:
   - `@wattry/tsconfig/base` — base `tsconfig` (`tsconfig.base.json`)
   - `@wattry/tsconfig/eslint` — `createBaseConfig` for a flat ESLint config
   - `@wattry/tsconfig/vitest` — base Vitest config
2. A **CLI** (`tsconfig`) that writes thin wrapper configs into your project, installs the matching dev dependencies, and tracks them in a manifest so you can diff and update later.

The goal is to centralize dev-dependency and config maintenance across many projects so versions stay in step.

## Getting started

```sh
pnpm init <name>
pnpm add -D @wattry/tsconfig
pnpm tsconfig init
```

`init` will:

- create `src/` and `types/` directories
- merge `package.json` (scripts, and `type`/`license` if unset)
- install the base dev dependencies with your package manager
- write wrapper configs that extend the base: `tsconfig.json`, `tsconfig.build.json`, `eslint.config.ts`, `vitest.config.ts`
- write a `.ts.config.json` manifest pinning the base version and config snapshots

Add an `index.ts` to `src/` that exports your public API (or the entry point you run), then build:

```sh
pnpm build      # tsc → dist/ (ESM + .d.ts typings)
pnpm publish
```

## CLI commands

```sh
tsconfig init      # scaffold configs, install deps, write manifest
tsconfig update    # bump @wattry/tsconfig, reinstall deps, show config diff
tsconfig inspect   # diff pinned manifest snapshot against the installed base config
tsconfig reset     # uninstall base deps and remove the wrapper configs + manifest

tsconfig override add <config> <key> --reason <text>   # document an intentional deviation
tsconfig override list
tsconfig override remove <config> <key>
```

Common flags: `-p, --package-manager <pnpm|npm|yarn>` (default `pnpm`), `-d, --debug`, `--verbose`.
`update` also takes `--target-version <string>` (default `latest`).

## Extending the base configs

ESLint (`eslint.config.ts`):

```ts
import { defineConfig } from 'eslint/config';
import { createBaseConfig } from '@wattry/tsconfig/eslint';

const files = ['**/*.ts'];
const ignores = ['dist/**/*', 'node_modules/**/*'];

// Add your own config object alongside the base to override:
// const customConfig = { /* ... */ };
// export default defineConfig([createBaseConfig(import.meta, { files, ignores }), customConfig]);

export default defineConfig(
  createBaseConfig(import.meta, { files, ignores })
);
```

Vitest (`vitest.config.ts`):

```ts
import base from '@wattry/tsconfig/vitest';

// export default { ...base, /* project-level overrides */ };
export default base;
```

## Maintaining

Keep this package upgraded so every consuming project stays on matching tool versions:

```sh
pnpm upgrade:all   # pnpm update --latest
```

In a consuming project, run `tsconfig update` to bump the base, reinstall deps, and review the config diff before it updates the pinned manifest.

## Contributing

Requires Node `^24` and pnpm.

```sh
pnpm install
pnpm build        # clean + tsc --project tsconfig.build.json → dist/
pnpm dev          # tsx watch on src/index.ts
pnpm typecheck    # tsc --noEmit --project tsconfig.json
pnpm lint         # eslint --config eslint.config.ts src/**/*.ts
pnpm test         # vitest (__tests__/**/*.test.ts)
```

The package is built with plain `tsc`, emitting ESM and `.d.ts` typings to `dist/`. A Husky `pre-commit` hook runs `lint` and `typecheck`. Publishing is automated by GitHub Actions on push to `main` when `package.json`'s `version` changes.

## License

Apache-2.0
