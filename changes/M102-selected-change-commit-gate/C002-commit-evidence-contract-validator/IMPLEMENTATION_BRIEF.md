# C002 Implementation Brief

## Goal

Implement the selected-change commit evidence contract and queue audit validator
chosen by C001 Option 1.

## Read First

- `changes/M102-selected-change-commit-gate/C002-commit-evidence-contract-validator/SELECTED_CHANGE.yaml`
- `changes/M102-selected-change-commit-gate/HIGH_RISK_DECISION_REPORT.md`
- `references/planning-artifact-contracts.md`
- `references/git-version-control-governance.md`
- `packages/core/src/validators/validateRepositoryContracts.ts`
- `packages/cli/src/dev/verifyRuntimeSurface.ts`

## Do

- Add a local evidence contract for `LOCAL_COMMIT_EVIDENCE.yaml`.
- Validate selected-change completion fields:
  `implementation_changed_files` and `commit_not_required_reason`.
- Make strict selected-change queues reject completed implementation candidates
  without local commit evidence.
- Add runtime fixtures for the M101-style batched completion failure mode.
- Keep C002 completion as a standalone local selected-change commit.

## Do Not

- Do not wire summaries or handoff trust gates; C003 owns that.
- Do not change remote git automation or PR-ready summary semantics.
- Do not edit generated `.agents/**` or managed `.openworkflow/**` surfaces.
- Do not advance C003 or C004 before C002 is committed with local evidence.

## Owned Paths

- `references/planning-artifact-contracts.md`
- `references/git-version-control-governance.md`
- `packages/core/src/validators/`
- `packages/cli/src/dev/verifyRuntimeSurface.ts`
- `schemas/candidate-changes.schema.json`
- `changes/M102-selected-change-commit-gate/`

## Validation

```bash
npm run build
npm run verify:runtime-surface
node dist/cli/src/index.js validate --root . --json
node dist/cli/src/index.js summaries --root . --strict --json
git diff --check
```

## Stop Conditions

- Stop if implementation would require handoff or summaries strict wiring before C003.
- Stop if remote git or GitHub mutation becomes necessary.
- Stop if generated adapters or managed `.openworkflow/**` surfaces need edits.
- Stop if the validator cannot preserve historical migration mode.
