# Change Analysis - Remaining Work Priority

Source of truth: `CHANGE_ANALYSIS.yaml`. This Markdown file is a readable view.

## Queues Analyzed

- `M54-decompose-select-change-planning`
- `M59-proto-redesign-planning-dogfood`
- `M68-post-proto-workflow-planning`
- `M69-skill-system-lifecycle-planning`
- `M70-high-risk-governance-planning`
- `M71-git-version-control-governance`

## Git State

- Current branch: `codex/m71-git-version-governance`
- Dirty tree at analysis start: `false`
- Note: older active queues do not record `queue_policy.branch_boundary`; under
  current git governance, confirm or add a feat branch boundary before selecting
  implementation work from those queues.

## Recommendation

Recommended next target: `M54-decompose-select-change-planning/C007`.

Reason: `C007` is ready, medium risk, dependency-satisfied, and directly
improves cross-queue selection arbitration. It also unlocks `C004`, which is
currently marked ready but depends on `C007`.

Handoff: use `select-change` on `M54/C007` after branch-boundary confirmation.

## Priority Order

1. `M54/C007` - Support cross-queue selection arbitration.
2. `M70/G005` - Convert M69 S003 into a design-only delivery boundary change.
3. `M68/H003` - Expose proto2html runtime command surface; high-risk report
   needed before selection.
4. `M54/C004` - Expose planning skills through runtime surfaces; wait for
   `C007`, then high-risk report.
5. `M68/H007` - Lifecycle transaction design; useful but not currently ready.

## Rejected Alternatives

- `M70/G005`: good medium-risk design work, but less directly tied to the
  current cross-queue selection problem than `C007`.
- `M68/H003`: high risk and missing a local high-risk decision report.
- `M54/C004`: depends on `C007` and is high risk.

## High-Risk Stop

No high-risk stop is required for the recommended target because `C007` is
medium risk. If choosing `H003` or `C004` instead, create or update the relevant
`HIGH_RISK_DECISION_REPORT.md` first and resume only after explicit approval of
a concrete option.
