# M18 Acceptance

M18 is accepted when the M17 E2E friction points are fixed and guarded by
runtime verification.

## Required Outcomes

- `ow-tune` can orchestrate proto behavior when there is validation but no
  prototype index.
- Design handoffs no longer include manual `/ow:decision`.
- `openworkflow init` writes every artifact template file referenced by
  `ARTIFACT_CONTRACTS.yaml`.
- `openworkflow --help` and `openworkflow -h` exit with code 0.

## Validation

- `npm run build` passes.
- `npm run validate` passes.
- `npm run verify:runtime-surface` passes.
- `npm run smoke:init` passes.
- `node dist/cli/src/index.js sync --root /tmp/openworkflow-m04-smoke --tools codex` passes.
- `node dist/cli/src/index.js doctor --root /tmp/openworkflow-m04-smoke --tools codex` passes.
- `npm run validate:cli` passes.
- `node dist/cli/src/index.js --help` exits 0.
