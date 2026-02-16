# Storybook Setup and Stability Notes

**Last Updated:** 2026-02-15

---

## Recommended Runtime

- Node.js: **LTS only** (`20.x` or `22.x`)
- `node >=20 <24` is enforced in `package.json`

Reason: non-LTS runtimes may surface webpack/plugin runtime incompatibilities earlier.

---

## Why Storybook Can Crash Here

This package uses Angular builder + Storybook builder in one process.

Without pinning, the dependency graph may resolve two webpack versions at once:
- Angular side (via `@angular-devkit/build-angular`) 
- Storybook side (via `@storybook/builder-webpack5`)

If both are loaded together, runtime checks like `instanceof Compilation` can fail.

---

## Stability Guard Applied

`package.json` includes:

- `pnpm.overrides.webpack = 5.105.2`

This forces a single webpack version across the dependency graph for this package.

---

## Commands

Install dependencies:

```bash
pnpm install
```

Start Storybook:

```bash
pnpm storybook
```

Build Storybook static output:

```bash
pnpm storybook:build
```

---

## Troubleshooting

If `pnpm storybook` fails with stack traces containing `Compilation`/`webpack` mismatch:

1. Confirm Node version is LTS (`node -v`).
2. Reinstall dependencies (`pnpm install`).
3. Verify effective webpack graph (`pnpm why webpack`) and ensure one resolved version.
4. Retry `pnpm storybook`.
