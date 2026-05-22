# C003 Implementation Brief

## Goal

Wire selected-change commit evidence enforcement into Agent trust gates so
unauditable completed implementation candidates cannot report trusted handoff.

## Read First

- `changes/M102-selected-change-commit-gate/C003-commit-evidence-trust-gates/SELECTED_CHANGE.yaml`
- `changes/M102-selected-change-commit-gate/HIGH_RISK_DECISION_REPORT.md`
- `packages/core/src/workflow/summaryHealth.ts`
- `packages/cli/src/commands/summaries.ts`
- `packages/cli/src/commands/handoff.ts`
- `packages/cli/src/commands/inspect.ts`
- `packages/cli/src/commands/context.ts`
- `packages/cli/src/dev/verifyRuntimeSurface.ts`

## Do

- Make `summaries --strict` fail when a strict active queue has a completed
  implementation selected change without local commit evidence.
- Make `handoff` fail through the same strict quality path.
- Surface remediation guidance in inspect/context output.
- Preserve migration-mode behavior for historical queues that are not opted
  into the strict selected-change commit gate.
- Add runtime fixtures for the M101-style missing per-candidate commit evidence
  failure mode.

## Do Not

- Do not change remote git behavior.
- Do not create commits automatically from trust gates.
- Do not edit generated `.agents/**` or managed `.openworkflow/**` surfaces.
- Do not implement git-automation guidance updates; C004 owns that.

## Owned Paths

- `packages/core/src/`
- `packages/cli/src/`
- `packages/cli/src/dev/verifyRuntimeSurface.ts`
- `changes/M102-selected-change-commit-gate/`

## Validation

```bash
npm run build
npm run verify:runtime-surface
node dist/cli/src/index.js validate --root . --json
node dist/cli/src/index.js summaries --root . --strict --json
node dist/cli/src/index.js handoff --root . --json
git diff --check
```

## Stop Conditions

- Stop if the change requires remote mutation or automatic commit creation.
- Stop if historical queues fail without opting into strict mode.
- Stop if generated adapter or managed `.openworkflow/**` edits become necessary.
