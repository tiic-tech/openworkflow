# C012 Implementation Brief

## Goal

Add verification coverage for the planning artifact registration contract while
avoiding runtime registry, adapter generation, and generated-surface changes.

## Read First

- `references/planning-artifact-contracts.md`
- `references/planning-skill-runtime-exposure.md`
- `packages/cli/src/dev/verifyRuntimeSurface.ts`
- `packages/cli/src/dev/verifyAgentE2E.ts`

## Do

- Add lightweight assertions that planning artifact registration is
  summary-first.
- Assert full candidate queues are not the default read model.
- Keep checks tied to source references and existing validation scripts.
- Update M54 queue evidence.

## Do Not

- Do not edit command registry or artifact registry source.
- Do not edit adapters or generated surfaces.
- Do not select C010, C011, or C013.

## Owned Paths

- `packages/cli/src/dev/verifyRuntimeSurface.ts`
- `packages/cli/src/dev/verifyAgentE2E.ts`
- `changes/M54-decompose-select-change-planning/C012-planning-read-model-verification/`
- M54 queue artifacts.

## Validation

```bash
npm run validate
npm run verify:runtime-surface
npm run verify:agent-e2e
git diff --check
```

## Stop Conditions

- Stop if verification requires generated-surface or adapter changes.
- Stop after C012 if the next candidate is C010, C011, or C013 without explicit approval.
