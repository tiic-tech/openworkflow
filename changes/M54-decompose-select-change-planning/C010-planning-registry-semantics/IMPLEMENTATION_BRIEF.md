# C010 Implementation Brief

## Goal

Record the approved planning command semantics for the three planning source
skills before generated adapter delivery.

## Read First

- `changes/M54-decompose-select-change-planning/HIGH_RISK_DECISION_REPORT.md`
- `changes/M54-decompose-select-change-planning/C010-planning-registry-semantics/SELECTED_CHANGE.yaml`
- `references/planning-skill-runtime-exposure.md`
- `references/planning-artifact-contracts.md`

## Do

- Record the C010 high-risk approval in the high-risk report.
- Define `/ow:decompose-to-changes`, `/ow:analyze-changes`, and
  `/ow:select-change` as accepted planning command ids.
- Preserve the distinction between decomposition, advisory analysis, and
  selected-change preparation.
- Update the M54 queue, readable view, and summary with C010 selection and
  completion evidence.

## Do Not

- Do not generate Codex `.agents/skills/ow-*` planning surfaces.
- Do not edit generated `.agents/**`, `.openworkflow/**`, or `AGENTS.md`.
- Do not implement C011 adapter delivery.
- Do not widen C010 into full C004 runtime exposure.

## Owned Paths

- `references/planning-skill-runtime-exposure.md`
- `changes/M54-decompose-select-change-planning/HIGH_RISK_DECISION_REPORT.md`
- `changes/M54-decompose-select-change-planning/C010-planning-registry-semantics/`
- `changes/M54-decompose-select-change-planning/CANDIDATE_CHANGES.yaml`
- `changes/M54-decompose-select-change-planning/CANDIDATE_CHANGES.md`
- `changes/M54-decompose-select-change-planning/SUMMARY.yaml`

## Validation

```bash
npm run validate
git diff --check
```

## Stop Conditions

- Stop if generated surfaces need to change.
- Stop if Codex adapter templates need to change.
- Stop before C011 unless the user explicitly approves the generated-surface
  high-risk follow-up.
