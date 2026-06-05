# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`@wattry/tsconfig` plays two roles at once:

1. **A shared-config package** — it publishes reusable base configs consumed via package `exports`:
   `./base` (`tsconfig.base.json`), `./eslint` (`eslint.base.ts` → `createBaseConfig`), `./vitest` (`vitest.config.ts`).
2. **A CLI** (`bin: tsconfig` → `dist/index.js`) that scaffolds and maintains those configs inside consumer projects.

The goal is centralizing dev-dependency and config maintenance across many projects so versions stay in step.

## Commands

```sh
pnpm build        # clean + tsc --project tsconfig.build.json → dist/
pnpm dev          # tsx watch on src/index.ts
pnpm typecheck    # tsc --noEmit --project tsconfig.json (checks src + tests + config files)
pnpm lint         # eslint --config eslint.config.ts src/**/*.ts
pnpm lint:fix     # same + --fix
pnpm test         # vitest (runs __tests__/**/*.test.ts)
pnpm test:watch   # vitest --watch
pnpm test:ci      # vitest with coverage + junit reporter
```

Run a single test file: `pnpm vitest __tests__/inspect.test.ts`
Run by name: `pnpm vitest -t 'diffCompilerOptions'`

Husky `pre-commit` runs `pnpm lint` then `pnpm typecheck` — both must pass to commit.

## Conventions / gotchas

- **ESM only** (`"type": "module"`). Intra-`src` imports use `.js` extensions even though sources are `.ts` (e.g. `import files from './files.js'`). Keep this pattern.
- **Two tsconfigs, different jobs**: `tsconfig.json` (typecheck — `rootDir: "."`, includes `src`/`types`/`__tests__`/config files) vs `tsconfig.build.json` (build — `rootDir: ./src`, emits to `dist/`). Edit the right one for the right purpose.
- `tsconfig.base.json` holds the actual strict compiler options; `tsconfig.json` extends it. The base is what consumers import via `./base`.
- ESLint flat config lives in **`.ts`** files (`eslint.config.ts` / `eslint.base.ts`), loaded via `jiti`. The real ruleset is in `eslint.base.ts`'s `createBaseConfig`.
- Build is plain `tsc` (no bundler); dev is `tsx watch`. If `package.json` scripts and README ever disagree, trust `package.json`.

## CLI architecture (`src/`)

`index.ts` is the Commander entry point defining five commands: `init`, `reset`, `inspect`, `update`, and `override` (with `add`/`list`/`remove` subcommands). Each command resolves a `projectDir` from `$PWD` and delegates to a focused module:

- **`files.ts`** — filesystem ops: makes `src`/`types` dirs, merges `package.json` additively, and writes the *thin wrapper* config files into the consumer project (`tsconfig.json`/`tsconfig.build.json` that `extends` the published base, plus `eslint.config.ts`/`vitest.config.ts` wrappers). Wrapper file contents are the `ESLINT_WRAPPER`/`VITEST_WRAPPER` string constants here.
- **`dependencies.ts`** — installs/uninstalls/updates dev deps by shelling out (`execSync`) to the chosen package manager (`pnpm`/`npm`/`yarn`).
- **`manifest.ts`** — reads/writes `.ts.config.json` in the consumer project. This manifest pins the base package `version`, config `snapshots`, and `overrides`.
- **`inspect.ts`** + **`diff.ts`** — `inspect`/`update` compare the manifest's pinned snapshots against the currently *installed* base config and print a diff. `diff.ts` holds the pure diff functions (`diffCompilerOptions`, line-based `diffText`); keep them side-effect-free.
- **`override.ts`** — manages override "notes" (config/key/reason) stored in the manifest, so intentional deviations from the base are documented.
- **`logger.ts`** — singleton `CLogger`. `Logger(level)` caches the **first** instance; the log level is fixed on first call for the whole process.
- **`types.ts`** — shared types and the key constant `tsConfigPath = $PWD/node_modules/@wattry/tsconfig`.

**Key runtime mechanism**: the CLI reads the *installed* base package's configs at runtime via `tsConfigPath` (the consumer's `node_modules/@wattry/tsconfig`), not from its own source tree. That's how `inspect`/`update` diff a consumer's pinned snapshot against the freshly installed package.

## Release

Versioning is owned by **release-please** (`release-please-config.json` + `.release-please-manifest.json`) — do **not** hand-edit `version` in `package.json`. The `pr.yaml` workflow fails any PR where `package.json` version ≠ the manifest.

- Releases are driven by **Conventional Commits**: `fix:` → patch, `feat:` → minor, `feat!:`/`BREAKING CHANGE` → major. Commits with none of these produce no release. `pr.yaml` posts a sticky comment previewing the next version and fails if the PR's base has gone stale.
- `release.yaml` (on push to `main`) runs `release-please-action`, which opens/maintains a **release PR** bumping `package.json` + the manifest and updating `CHANGELOG.md`. Merging that PR tags `v{version}` and cuts a GitHub Release — and, in the same run (gated on the action's `releases_created` output), builds and **publishes to GitHub Packages** via `pnpm publish` (`registry-url` + `NODE_AUTH_TOKEN`).

To cut a release: land Conventional-Commit PRs into `main`, then merge the release PR release-please raises. Uses `secrets.RELEASE_PLEASE_TOKEN` (a PAT) for the release step; `GITHUB_TOKEN` with `packages: write` for publish.

<!-- stackit:start -->
## Git Workflow: Stacked PRs

This project uses [stackit](https://github.com/getstackit/stackit) for stacked changes.
AI agents should proactively work in stacks.

### Why Stack?
Small PRs get reviewed faster. Break features into focused, reviewable units.

### When to Stack
Stack when your change has 2+ logical phases, exceeds ~400 lines,
or would benefit from early review of foundational work.

### Workflow
```bash
git add -A                              # Stage first
echo "feat: ..." | stackit create -F -  # Create stacked branch (message via stdin)
# ... continue working ...
stackit submit                          # Submit all PRs
```

### Key Commands
| Command | Purpose |
|---------|---------|
| `echo "feat: msg" \| stackit create -F -` | Create stacked branch |
| `stackit submit` | Push & create/update PRs |
| `stackit restack --upstack` | Rebase children after editing a branch (never manual `git rebase`) |
| `stackit sync` | Pull trunk, cleanup merged |
| `stackit log` | Visualize branch tree |

Run `/stackit` for the full skill, or `/stack-status` to check current state.
<!-- stackit:end -->
