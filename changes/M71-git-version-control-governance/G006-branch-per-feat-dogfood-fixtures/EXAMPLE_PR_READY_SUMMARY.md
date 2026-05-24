# PR Ready Summary - Example

This is an example handoff artifact. It does not mean a PR was opened, edited,
pushed, merged, or approved.

## Feat

- Plan id: `M71-git-version-control-governance`
- Branch boundary: `codex/m71-git-version-governance`
- Source queue: `changes/M71-git-version-control-governance/CANDIDATE_CHANGES.yaml`

## Completed Changes

- `G001-git-governance-contract`: established git governance hierarchy.
- `G002-dtc-branch-boundary-fields`: recorded branch boundary behavior in DTC.
- `G003-select-branch-dirty-guards`: added select-change git guards.
- `G004-git-governance-validation`: validated branch-governance metadata.
- `G005-pr-ready-summary-contract`: defined this handoff artifact contract.

Commit hashes can be added after local commits are available as
`commit: <7-40 hex chars>` evidence.

## Deferred Or Blocked Changes

- List candidates intentionally left out of the review.

## High-Risk Decisions

- Link `HIGH_RISK_DECISION_REPORT.md` when a high-risk candidate is next or
  unresolved.

## Validation

- `npm run validate`
- `git diff --check`
- `npm run verify:runtime-surface` when runtime or verification fixtures change

## Review Notes

- This artifact is local evidence only.
- Remote PR creation or mutation requires separate gh operation governance.
