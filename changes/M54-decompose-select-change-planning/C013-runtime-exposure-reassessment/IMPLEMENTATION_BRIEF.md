# C013 Implementation Brief

## Goal

Reassess the completed planning command work against the full OpenWorkflow
workflow blueprint.

## Read First

- `docs/OW_DEVELOP_PLAN.md`
- `docs/OW_DEVELOP_PLAN_Phase2.md`
- `changes/M54-decompose-select-change-planning/C013-runtime-exposure-reassessment/SELECTED_CHANGE.yaml`
- `changes/M54-decompose-select-change-planning/HIGH_RISK_DECISION_REPORT.md`

## Do

- Record that DTC/AC/SC are the planning intelligence layer inside
  `/ow:change`.
- Preserve the larger workflow chain:
  `vision -> validation -> proto -> tune -> proto2html -> html2spec -> build -> change -> archive`.
- Name `/ow:review`, `/ow:build-agent`, and `/ow:build-skill` as supporting
  advanced surfaces that still need design and runtime contracts.
- Recommend a new queue for full workflow blueprint runtime alignment.
- Update M54 queue, readable view, summary, and high-risk report evidence.

## Do Not

- Do not add new runtime command code.
- Do not change generated `.agents/**`, `.openworkflow/**`, or `AGENTS.md`.
- Do not mark full OW workflow runtime exposure complete.
- Do not fold `proto2html`, `html2spec`, `build`, `review`, or `archive` into
  DTC/AC/SC.

## Owned Paths

- `changes/M54-decompose-select-change-planning/C013-runtime-exposure-reassessment/`
- `changes/M54-decompose-select-change-planning/CANDIDATE_CHANGES.yaml`
- `changes/M54-decompose-select-change-planning/CANDIDATE_CHANGES.md`
- `changes/M54-decompose-select-change-planning/SUMMARY.yaml`
- `changes/M54-decompose-select-change-planning/HIGH_RISK_DECISION_REPORT.md`

## Validation

```bash
npm run validate
git diff --check
```
