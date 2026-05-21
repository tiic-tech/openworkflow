# G001 - High-Risk Decision Report Contract

## Goal

Make `HIGH_RISK_DECISION_REPORT.md` a first-class planning artifact with a
stable format and stop/resume rules.

## Read First

- `references/planning-artifact-contracts.md`
- `changes/M69-skill-system-lifecycle-planning/HIGH_RISK_DECISION_REPORT.md`
- `changes/M70-high-risk-governance-planning/CANDIDATE_CHANGES.yaml`

## Do

- Add a high-risk report section to `references/planning-artifact-contracts.md`.
- Define required sections, output location, summary linkage, and operation log
  expectations.
- State that implementation resumes only after explicit user approval of a
  concrete decision option.
- Update the M70 queue and summary with selection and completion evidence.

## Do Not

- Do not change planning source skills in this candidate.
- Do not implement validation code.
- Do not select or implement M69 `S003` or `S007`.
- Do not edit generated `.agents/**` or `.openworkflow/**`.

## Owned Paths

- `references/planning-artifact-contracts.md`
- `changes/M70-high-risk-governance-planning/G001-high-risk-report-contract/`
- `changes/M70-high-risk-governance-planning/CANDIDATE_CHANGES.yaml`
- `changes/M70-high-risk-governance-planning/CANDIDATE_CHANGES.md`
- `changes/M70-high-risk-governance-planning/SUMMARY.yaml`

## Validation

- `npm run validate`
- `git diff --check`

## Stop Conditions

- Stop if the contract requires implementation behavior in source skills.
- Stop if the report format conflicts with existing planning artifact cadence.
