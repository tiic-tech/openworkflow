# M105 C001 Implementation Brief

## Objective

Fix the M104 summarize/validate contradiction:

1. `openworkflow summarize --write` wrote `.openworkflow/prototypes/proto-m104/SUMMARY.yaml`.
2. The generated summary used `contract_type: summary` and omitted `status`.
3. `openworkflow validate --json` rejected that generated file.

The expected behavior is that deterministic summary files written by OW remain
compatible with OW validation and summary trust gates.

## Scope

In scope:

- summary writer output shape
- focused regression coverage
- documentation/planning artifacts under M105

Out of scope:

- broad summary schema redesign
- weakening validation for source artifacts
- prompt2proto image strategy
- commit evidence backfill
- current vision pointer fixes

## Implementation Notes

Archived prototype summaries already use a validation-compatible shape:

```yaml
contract_id: summary:prototype_evidence:<id>
contract_type: workflow
artifact_type: artifact_summary
status: current
```

C001 should prefer making the writer emit that shape over loosening validate.

## Validation

Run:

- `npm run build`
- `npm run verify:runtime-surface`
- `node dist/cli/src/index.js validate --root . --json`
- `node dist/cli/src/index.js summaries --root . --strict --json`
- `git diff --check`
