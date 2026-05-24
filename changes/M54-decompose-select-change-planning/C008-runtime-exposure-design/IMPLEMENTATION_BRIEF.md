# C008 Implementation Brief

## Goal

Write the design-only boundary for future planning skill runtime exposure.

## Read First

- `changes/M54-decompose-select-change-planning/HIGH_RISK_DECISION_REPORT.md`
- `changes/M54-decompose-select-change-planning/C008-runtime-exposure-design/SELECTED_CHANGE.yaml`
- `references/planning-artifact-contracts.md`
- `references/skill-system-lifecycle.md`

## Do

- Add `references/planning-skill-runtime-exposure.md`.
- Define core, artifact, adapter, generated-surface, read-model, and validation boundaries.
- Document summary-first context expectations for planning artifacts.
- Split C004 follow-up implementation into smaller candidates and mark high-risk gates.
- Update M54 queue, readable view, and summary with selection and completion evidence.

## Do Not

- Do not edit runtime command registry code.
- Do not edit artifact registry code.
- Do not edit Codex adapter generation code.
- Do not edit generated `.agents/**`, `.openworkflow/**`, or `AGENTS.md`.
- Do not implement C004 runtime exposure.

## Owned Paths

- `references/planning-skill-runtime-exposure.md`
- `changes/M54-decompose-select-change-planning/C008-runtime-exposure-design/`
- `changes/M54-decompose-select-change-planning/CANDIDATE_CHANGES.yaml`
- `changes/M54-decompose-select-change-planning/CANDIDATE_CHANGES.md`
- `changes/M54-decompose-select-change-planning/SUMMARY.yaml`

## Validation

```bash
npm run validate
git diff --check
```

## Stop Conditions

- Stop if runtime or adapter implementation becomes necessary.
- Stop if generated surfaces need to change.
- Stop if a follow-up candidate remains high risk and lacks explicit user approval.
