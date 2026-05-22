# C001 Implementation Brief

## Goal

Record the selected-change commit enforcement policy before any implementation
work begins.

## Read First

- `changes/M102-selected-change-commit-gate/HIGH_RISK_DECISION_REPORT.md`
- `changes/M102-selected-change-commit-gate/C001-selected-change-commit-enforcement-policy/SELECTED_CHANGE.yaml`
- `references/git-version-control-governance.md`
- `references/planning-artifact-contracts.md`

## Do

- Treat Option 1, Strict Evidence Gate With Migration Mode, as the approved
  policy for C002 through C004.
- Keep C001 design-only.
- Preserve the distinction between implementation selected changes and
  planning-only selected changes.
- Keep historical queue migration behavior explicit.
- Use the recorded C001 local commit evidence before selecting or implementing C002.

## Do Not

- Do not edit implementation source files.
- Do not edit generated `.agents/**` or managed `.openworkflow/**` surfaces.
- Do not change schemas, validators, runtime fixtures, or git automation code.
- Do not advance into C002, C003, or C004 unless C001 local commit evidence is present.
- Do not perform remote push, PR creation, merge, or GitHub Issue mutation.

## Owned Paths

- `changes/M102-selected-change-commit-gate/HIGH_RISK_DECISION_REPORT.md`
- `changes/M102-selected-change-commit-gate/CANDIDATE_CHANGES.yaml`
- `changes/M102-selected-change-commit-gate/CANDIDATE_CHANGES.md`
- `changes/M102-selected-change-commit-gate/SUMMARY.yaml`
- `changes/M102-selected-change-commit-gate/C001-selected-change-commit-enforcement-policy/`

## Validation

```bash
node dist/cli/src/index.js validate --root . --json
node dist/cli/src/index.js summaries --root . --strict --json
git diff --check
```

## Stop Conditions

- Stop if policy selection requires implementation source edits.
- Stop if generated adapter or managed audit surfaces need changes.
- Stop if the gate cannot distinguish implementation edits from planning-only
  selected changes.
- Stop if enforcing the policy would require rewriting historical commits or
  remote mutation.
