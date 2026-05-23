# C004 - PR #4 Readiness Decision

## Goal

Resolve whether PR #4 should be prepared for ready-for-review in M123 or
deferred to separate M102-specific readiness governance.

## Read First

- `changes/M123-pr-ready-review-governance/C003-pr5-ready-review-transition/PR5_READY_REVIEW_AUDIT.md`
- `changes/M123-pr-ready-review-governance/HIGH_RISK_DECISION_REPORT.md`

## Do

- Refresh PR #4 read-only facts.
- Compare the remote branch head with PR #4 head OID.
- Record either an exact approval packet or an explicit deferral.

## Do Not

- Do not run `gh pr ready 4`.
- Do not merge, close, edit, retarget, or comment on any PR.
- Do not mutate Issues, push, force-push, rebase, reset, or delete branches.

## Owned Paths

- `changes/M123-pr-ready-review-governance/`

## Validation

- `gh pr view 4 --repo tiic-tech/openworkflow --json number,url,state,isDraft,title,headRefName,baseRefName,headRefOid,baseRefOid,mergeable,reviewDecision,statusCheckRollup`
- `git diff --check`

## Stop Conditions

- Stop before any PR #4 remote mutation unless the user approves an exact command in a future queue.
