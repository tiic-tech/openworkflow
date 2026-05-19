# M21 Acceptance

M21 is accepted when OpenWorkflow is ready for a scoped public npm release
without publishing from the implementation branch.

## Required Outcomes

- `package.json` uses `@tiic-tech/openworkflow`.
- The installed binary command remains `openworkflow`.
- `publishConfig.access` is `public`.
- Package metadata points to the GitHub repository.
- LICENSE contains the MIT license.
- README documents install, CLI usage, and release checks.
- `prepack` rebuilds `dist`.
- `prepublishOnly` runs core validation.
- `npm pack --dry-run` succeeds for `@tiic-tech/openworkflow@0.1.0`.

## Validation

- `npm run build` passes.
- `npm run validate` passes.
- `npm run verify:runtime-surface` passes.
- `npm run verify:e2e-workflow` passes.
- `npm run smoke:init` passes.
- `node dist/cli/src/index.js sync --root /tmp/openworkflow-m04-smoke --tools codex` passes.
- `node dist/cli/src/index.js doctor --root /tmp/openworkflow-m04-smoke --tools codex` passes.
- `npm run validate:cli` passes.
- `npm pack --dry-run` passes.
