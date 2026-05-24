# G002 - DTC High-Risk Report Behavior

## Goal

Teach `decompose-to-changes` how to create and maintain
`HIGH_RISK_DECISION_REPORT.md` when a queue reaches high-risk candidates.

## Read First

- `references/planning-artifact-contracts.md`
- `skills/decompose-to-changes/SKILL.md`
- `skills/decompose-to-changes/references/decomposition-protocol.md`
- `changes/M69-skill-system-lifecycle-planning/HIGH_RISK_DECISION_REPORT.md`

## Do

- Add high-risk report workflow guidance to the DTC source skill.
- Add detailed report maintenance rules to the decomposition protocol.
- Preserve candidate ids and statuses when creating report evidence.
- Link reports from summary/readable view and operation logs.

## Do Not

- Do not modify `select-change`.
- Do not implement schema or TypeScript validation.
- Do not select or implement high-risk candidates.
- Do not edit generated `.agents/**` or `.openworkflow/**`.

## Owned Paths

- `skills/decompose-to-changes/SKILL.md`
- `skills/decompose-to-changes/references/decomposition-protocol.md`
- `changes/M70-high-risk-governance-planning/G002-dtc-high-risk-report-behavior/`

## Validation

- `python3 /Users/archy/.codex/skills/.system/skill-creator/scripts/quick_validate.py skills/decompose-to-changes`
- `npm run validate`
- `git diff --check`

## Stop Conditions

- Stop if behavior requires selecting or implementing a high-risk candidate.
- Stop if duplicate report semantics are needed beyond the artifact contract.
