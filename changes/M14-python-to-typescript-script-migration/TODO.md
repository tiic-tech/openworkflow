# M14 TODO

M14 migrates the active script path from Python to TypeScript. The key boundary
is active workflow tooling, not historical repo-local skill prototypes.

## Plan

1. [x] Port repository contract validation into `packages/core/src/validators`.
2. [x] Add CLI/dev TypeScript wrapper for repository validation.
3. [x] Port runtime surface verification into `packages/cli/src/dev`.
4. [x] Update npm scripts and active docs away from legacy root script commands.
5. [x] Remove root Python scripts after TypeScript parity passes.
6. [x] Document legacy skill helper scripts as a separate migration queue.
7. [x] Run full validation.

## Completion Checklist

- [x] `npm run validate` uses TypeScript.
- [x] `npm run verify:runtime-surface` uses TypeScript.
- [x] Root active scripts no longer depend on Python.
- [x] Repository contract checks preserve current coverage.
- [x] Runtime surface checks preserve current coverage.
- [x] Legacy skill helper scripts are inventoried.
- [x] Full validation passes.
