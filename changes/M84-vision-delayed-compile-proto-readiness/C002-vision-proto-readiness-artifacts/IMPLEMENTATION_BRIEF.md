# C002 Vision Proto-Readiness Artifacts

## Goal

Extend vision artifacts so compiled vision can explicitly tell `/ow:proto`
whether it has enough strategic input to generate strong prototype prompts.

## Read First

- `changes/M84-vision-delayed-compile-proto-readiness/C002-vision-proto-readiness-artifacts/SELECTED_CHANGE.yaml`
- `docs/DISCOVER_LOOP_UPGRATE_PLAN.md`
- `packages/core/src/artifacts/registry.ts`
- `packages/core/src/workflow/summaryHealth.ts`
- `schemas/vision-session.schema.json`

## Do

- Add `strategic_core`, `product_system_seed`, `proto_readiness`, and `coverage`
  to vision session templates and schemas.
- Make summary quality inspect nested proto-readiness fields.
- Refresh generated artifact contracts through `openworkflow sync`.
- Update verification to protect the new template fields.

## Do Not

- Do not change `/ow:proto`, `/ow:validation`, or `/ow:tune` behavior.
- Do not hand-edit generated `.openworkflow/**` files as the source fix.
- Do not implement the generated `/ow:vision` protocol changes in this step.

## Owned Paths

- `packages/core/src/artifacts/registry.ts`
- `packages/core/src/workflow/summaryHealth.ts`
- `packages/core/src/validators/validateOpenWorkflow.ts`
- `schemas/vision-session.schema.json`
- `packages/cli/src/dev/verifyWorkflowE2E.ts`
- `packages/cli/src/dev/verifyRuntimeSurface.ts`
- generated `.openworkflow/audit/ARTIFACT_CONTRACTS.yaml` through sync

## Validation

- `npm run build`
- `npm run validate`
- `node dist/cli/src/index.js sync --root . --json`
- `node dist/cli/src/index.js validate --root . --json`
- `git diff --check`
