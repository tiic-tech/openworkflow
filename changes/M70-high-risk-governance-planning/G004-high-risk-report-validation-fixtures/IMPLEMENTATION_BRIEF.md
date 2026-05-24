# G004 - High-Risk Report Validation And Fixtures

## Goal

Make high-risk decision reports mechanically checkable enough that future
dogfood work cannot silently drop required sections.

## Read First

- `references/planning-artifact-contracts.md`
- `changes/M69-skill-system-lifecycle-planning/HIGH_RISK_DECISION_REPORT.md`
- `packages/core/src/validators/validateRepositoryContracts.ts`
- `packages/cli/src/dev/verifyRuntimeSurface.ts`

## Do

- Validate required `HIGH_RISK_DECISION_REPORT.md` sections.
- Add negative runtime verification for a missing report section.
- Ensure the current M69 high-risk report satisfies the contract.
- Run quick validation for both planning skills.

## Do Not

- Do not implement S003 or S007.
- Do not change risk classification semantics.
- Do not create a full Markdown schema framework.
- Do not edit generated `.agents/**` or `.openworkflow/**`.

## Owned Paths

- `packages/core/src/validators/validateRepositoryContracts.ts`
- `packages/cli/src/dev/verifyRuntimeSurface.ts`
- `changes/M69-skill-system-lifecycle-planning/HIGH_RISK_DECISION_REPORT.md`
- `changes/M70-high-risk-governance-planning/G004-high-risk-report-validation-fixtures/`

## Validation

- `npm run validate`
- `npm run verify:runtime-surface`
- `python3 /Users/archy/.codex/skills/.system/skill-creator/scripts/quick_validate.py skills/decompose-to-changes`
- `python3 /Users/archy/.codex/skills/.system/skill-creator/scripts/quick_validate.py skills/select-change`
- `git diff --check`

## Stop Conditions

- Stop if validation requires a broad Markdown schema framework.
- Stop if existing report semantics conflict with the planning artifact contract.
