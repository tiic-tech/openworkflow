# C007 Dogfood Cross-Queue Evidence

## Source

- `changes/M72-remaining-change-priority-analysis/CHANGE_ANALYSIS.yaml`
- `changes/M72-remaining-change-priority-analysis/CHANGE_ANALYSIS.md`
- `docs/OW_DEVELOP_PLAN_Phase2.md`

## Decision

The dogfood decision selected
`M54-decompose-select-change-planning/C007` as the next implementation target.

The recommendation was cross-queue because the active remaining-work analysis
compared multiple queues:

- `M54-decompose-select-change-planning`
- `M68-post-proto-workflow-planning`
- `M69-skill-system-lifecycle-planning`
- `M70-high-risk-governance-planning`
- `M71-git-version-control-governance`

## Selected Target

- `plan_id`: `M54-decompose-select-change-planning`
- `candidate_id`: `C007`
- Reason: ready, medium risk, dependency-satisfied, and directly strengthens
  native selection arbitration before high-risk runtime exposure.

## Rejected Alternatives

- `M70-high-risk-governance-planning/G005`: useful design-only mitigation, but
  less directly tied to the current cross-queue selection gap.
- `M68-post-proto-workflow-planning/H003`: high risk and missing a local
  high-risk decision report.
- `M54-decompose-select-change-planning/C004`: depends on C007 and is high risk.

## Behavior Proven

This dogfood pass proves that `select-change` needs to consume an advisory
cross-queue analysis, re-check the current target queue, and then write
selection artifacts inside the selected queue folder while preserving rejected
alternatives by `plan_id` and `candidate_id`.
