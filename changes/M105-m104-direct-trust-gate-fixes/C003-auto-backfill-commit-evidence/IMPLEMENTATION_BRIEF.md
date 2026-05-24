# M105 C003 Implementation Brief

## Objective

Remove the M104 manual repair loop around `LOCAL_COMMIT_EVIDENCE.yaml`.

When `git-automation commit --commit-evidence` creates the evidence file, it
should also link that evidence path into existing completion evidence arrays
for the queue candidate and selected-change artifact when doing so is safe.

## Approved High-Risk Option

Use Option A from
`changes/M105-m104-direct-trust-gate-fixes/HIGH_RISK_DECISION_REPORT.md`.

Backfill only when:

- `--commit-evidence` is present.
- `--evidence-path` is inside the selected candidate folder.
- the candidate is already `done`.
- the queue candidate has a `completion` object.
- the selected-change artifact has a `completion` object.
- the evidence path is absent from at least one completion evidence array.

Do not create completion sections, change statuses, weaken strict gates, or
rewrite historical queues.

## Validation

Run:

- `npm run build`
- `npm run verify:runtime-surface`
- `node dist/cli/src/index.js validate --root . --json`
- `node dist/cli/src/index.js summaries --root . --strict --json`
- `node dist/cli/src/index.js handoff --root . --json`
- `git diff --check`
