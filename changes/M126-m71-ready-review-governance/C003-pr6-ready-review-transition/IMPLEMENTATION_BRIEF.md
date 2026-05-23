# C003 - Approved PR #6 Ready-For-Review Transition

## Goal

Execute the exact approved PR #6 ready-for-review transition and record local
audit evidence.

## Read First

- `changes/M126-m71-ready-review-governance/HIGH_RISK_DECISION_REPORT.md`
- `changes/M126-m71-ready-review-governance/C003-pr6-ready-review-transition/TRANSITION_EVIDENCE.md`
- `changes/M126-m71-ready-review-governance/CANDIDATE_CHANGES.yaml`

## Do

- Treat C003 as complete after confirming PR #6 is no longer draft.
- Hand off to C004 for local readiness governance audit.

## Do Not

- Do not merge PR #6.
- Do not edit, close, retarget, request review, or comment on PR #6.
- Do not mutate Issues.
- Do not push, force-push, rebase, reset, delete branches, or perform branch surgery.
- Do not change product source.

## Owned Paths

- `changes/M126-m71-ready-review-governance/`

## Validation

- `gh pr view 6 --repo tiic-tech/openworkflow --json number,url,state,isDraft,title,headRefName,baseRefName,headRefOid,baseRefOid,mergeable,reviewDecision,statusCheckRollup`
- `node dist/cli/src/index.js validate --root . --json`
- `git diff --check`

## Stop Conditions

- Stop before any merge, PR edit, Issue mutation, push, or branch surgery.
