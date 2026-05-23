# C002 - PR #6 Ready-For-Review Decision Packet

## Goal

Prepare local high-risk decision evidence for marking PR #6 ready for review,
without performing the remote ready-for-review mutation.

## Read First

- `changes/M126-m71-ready-review-governance/C001-pr6-readiness-preflight/READINESS_PREFLIGHT.md`
- `changes/M126-m71-ready-review-governance/HIGH_RISK_DECISION_REPORT.md`
- `changes/M126-m71-ready-review-governance/C002-pr6-ready-review-decision/SELECTED_CHANGE.yaml`
- `changes/M126-m71-ready-review-governance/CANDIDATE_CHANGES.yaml`

## Do

- Treat the high-risk report as evidence, not approval.
- Preserve the exact approval text for C003.
- Keep C003 blocked until the user approves the exact command.

## Do Not

- Do not run `gh pr ready`.
- Do not merge PR #6.
- Do not edit, close, retarget, request review, or comment on PR #6.
- Do not mutate Issues.
- Do not push, force-push, rebase, reset, delete branches, or perform branch surgery.
- Do not change product source.

## Owned Paths

- `changes/M126-m71-ready-review-governance/`

## Validation

- `node dist/cli/src/index.js validate --root . --json`
- `git diff --check`

## Stop Conditions

- Stop before C003 unless the user provides the exact approval text recorded in `HIGH_RISK_DECISION_REPORT.md`.
- Stop if PR #6 is no longer draft before C003.
- Stop if PR #6 head OID changes before C003.
- Stop if PR #6 becomes non-mergeable before C003.
