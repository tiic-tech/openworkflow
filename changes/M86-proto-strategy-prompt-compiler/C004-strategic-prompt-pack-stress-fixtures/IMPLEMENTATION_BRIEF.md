# C004 Implementation Brief

Add stress fixtures for the `/ow:proto` strategic prompt-pack quality gates.

## Goal

Verify that the decomposed proto pipeline does not accept prompt packs that are
too thin for downstream generation or directions that differ only by visual
style. Keep one positive fixture that proves a proto-ready prompt pack can carry
concrete screens, interactions, AI/system behavior, trust controls, and sample
content.

## Read First

- `packages/cli/src/dev/verifyRuntimeSurface.ts`
- `packages/cli/src/dev/verifyWorkflowE2E.ts`
- `packages/core/src/validators/validateRepositoryContracts.ts`
- `packages/core/src/validators/validateOpenWorkflow.ts`

## Do

- Add a thin prompt-pack fixture and assert it fails clearly.
- Add a style-only direction fixture and assert it fails clearly.
- Add a high-quality strategic prompt-pack fixture and assert it passes.
- Keep assertions aligned with the internal `/ow:vision2prompt` and
  `/ow:prompt2proto` pipeline shape from C005.

## Do Not

- Do not generate prototype images.
- Do not add browser or visual inspection.
- Do not change `/ow:tune` behavior.
- Do not add HTML, proto2html, or production implementation scope.

## Validation

- `npm run build`
- `npm run validate`
- `npm run verify:e2e-workflow`
- `npm run verify:runtime-surface`
- `node dist/cli/src/index.js validate --root . --json`
- `git diff --check`
