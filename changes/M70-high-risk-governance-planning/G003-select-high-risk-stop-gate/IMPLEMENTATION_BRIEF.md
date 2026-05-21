# G003 - Select-Change High-Risk Stop Gate

## Goal

Teach `select-change` to stop before selecting `risk: high` candidates unless
the user explicitly approves a concrete decision option.

## Read First

- `references/planning-artifact-contracts.md`
- `skills/select-change/SKILL.md`
- `skills/select-change/references/selection-protocol.md`
- `changes/M69-skill-system-lifecycle-planning/HIGH_RISK_DECISION_REPORT.md`

## Do

- Add high-risk stop-gate behavior to the select-change workflow.
- Add targeted review output expectations for high-risk candidates.
- Define explicit override/resume criteria.
- Require selection evidence to name the approved decision option if the user
  overrides the stop.

## Do Not

- Do not modify `decompose-to-changes`.
- Do not implement high-risk candidates.
- Do not change adapter or runtime code.
- Do not edit generated `.agents/**` or `.openworkflow/**`.

## Owned Paths

- `skills/select-change/SKILL.md`
- `skills/select-change/references/selection-protocol.md`
- `changes/M70-high-risk-governance-planning/G003-select-high-risk-stop-gate/`

## Validation

- `python3 /Users/archy/.codex/skills/.system/skill-creator/scripts/quick_validate.py skills/select-change`
- `npm run validate`
- `git diff --check`

## Stop Conditions

- Stop if the behavior would allow implicit high-risk selection.
- Stop if the workflow needs schema or runtime code changes.
