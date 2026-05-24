# M129 C004 Implementation Brief

## Goal

Execute and record only the exact approved PR #4 merge command.

## Read First

- `changes/M129-remaining-ready-pr-merge-governance/HIGH_RISK_DECISION_REPORT.md`
- `changes/M129-remaining-ready-pr-merge-governance/C004-approved-pr4-merge/MERGE_EVIDENCE.md`
- `changes/M129-remaining-ready-pr-merge-governance/CANDIDATE_CHANGES.yaml`

## Do

- Verify approval text and PR #4 head before merge execution.
- Run exactly `gh pr merge 4 --repo tiic-tech/openworkflow --merge --match-head-commit bd2780b1d5b117b2734e5b732164e5d299bd521a`.
- Record PR #4 merged state, merge commit, remote main, and remaining open PRs.

## Do Not

- Do not merge any other PR.
- Do not push, force-push, rebase, reset, checkout, delete branches, or perform branch surgery.
- Do not edit PRs, close PRs, request reviews, comment on PRs, or mutate Issues.
- Do not change product source files or generated OpenWorkflow surfaces.

## Owned Paths

- `changes/M129-remaining-ready-pr-merge-governance/`

## Validation

- `gh pr view 4 --repo tiic-tech/openworkflow --json number,url,state,isDraft,mergedAt,mergeCommit,headRefName,baseRefName,headRefOid,baseRefOid,mergeable,statusCheckRollup,title`
- `gh pr list --repo tiic-tech/openworkflow --state open --json number,url,title,isDraft,headRefName,baseRefName,headRefOid,baseRefOid,mergeable,reviewDecision,statusCheckRollup --limit 20`
- `node dist/cli/src/index.js validate --root . --json`
- `node dist/cli/src/index.js summaries --root . --strict --json`
- `git diff --check`

## Stop Conditions

- PR #4 is not merged after command execution.
- Merge commit cannot be resolved from GitHub.
- Remaining PR state cannot be recorded for C005 handoff.
