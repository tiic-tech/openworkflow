# C003 - PR #5 Ready-For-Review Transition

## Goal

Execute the exact approved PR #5 ready-for-review command and record local audit
evidence.

## Read First

- `changes/M123-pr-ready-review-governance/C002-pr5-ready-review-decision/PR5_READY_REVIEW_DECISION.md`
- `changes/M123-pr-ready-review-governance/HIGH_RISK_DECISION_REPORT.md`

## Do

- Verify the exact approval text.
- Re-check PR #5 immediately before mutation.
- Execute only `gh pr ready 5 --repo tiic-tech/openworkflow`.
- Record before state, command, after state, result, and rollback guidance.

## Do Not

- Do not mark PR #4 ready.
- Do not merge, close, edit, retarget, or comment on any PR.
- Do not mutate Issues, push, force-push, rebase, reset, or delete branches.

## Owned Paths

- `changes/M123-pr-ready-review-governance/`

## Validation

- `gh pr view 5 --repo tiic-tech/openworkflow --json number,url,state,isDraft,title,headRefName,baseRefName,headRefOid,baseRefOid`
- `git diff --check`

## Stop Conditions

- Stop if the requested operation differs from the exact approved command.
- Stop if any follow-up would mutate PR #4, merge, close, edit, or push.
