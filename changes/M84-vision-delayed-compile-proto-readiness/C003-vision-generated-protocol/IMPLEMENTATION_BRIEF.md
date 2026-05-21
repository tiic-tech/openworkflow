# C003 Vision Generated Protocol

## Goal

Make generated `/ow:vision` guidance formally consume the new native
`build-vision` behavior: it should act as product partner, requirements
interrogator, and intent compiler; preserve interview flow; write only at
checkpoints or compile; and compile only when proto-readiness is strong enough
for `/ow:proto`.

## Non-Goals

- Do not change `/ow:validation`, `/ow:proto`, or `/ow:tune`.
- Do not create validation, prototype, spec, change, or runtime artifacts.
- Do not introduce UI behavior or a new command.

## Verification

- `npm run build`
- `npm run validate`
- `npm run verify:e2e-workflow`
- `node dist/cli/src/index.js sync --root . --json`
- `node dist/cli/src/index.js validate --root . --json`
- `git diff --check`
