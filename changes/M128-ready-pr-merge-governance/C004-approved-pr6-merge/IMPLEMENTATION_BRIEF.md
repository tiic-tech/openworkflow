# C004 Approved PR #6 Merge

## Goal

Execute and record only the exact approved PR #6 merge command.

## Read First

- `changes/M128-ready-pr-merge-governance/HIGH_RISK_DECISION_REPORT.md`
- `changes/M128-ready-pr-merge-governance/C002-decide-first-merge-target-and-stop-gates/FIRST_MERGE_TARGET_DECISION.md`

## Do

- Verify C004 approval text exactly matches the report.
- Verify PR #6 current head/base/mergeable state before command execution.
- Run the exact approved `gh pr merge` command.
- Verify PR #6 merged and record merge evidence.
- Record remaining PR follow-up boundary.

## Do Not

- Do not merge PR #4, PR #5, or PR #7.
- Do not push, force-push, rebase, reset, delete branches, or switch branches.
- Do not edit PRs or mutate Issues.
- Do not change product source.

## Owned Paths

- `changes/M128-ready-pr-merge-governance/`

## Validation

- `gh pr view 6 --repo tiic-tech/openworkflow --json number,url,state,isDraft,mergedAt,mergeCommit,title,headRefName,baseRefName,headRefOid,baseRefOid,mergeable,statusCheckRollup`
- `git ls-remote origin refs/heads/main refs/heads/codex/m71-git-version-governance`
- `gh pr list --repo tiic-tech/openworkflow --state open --json number,url,title,isDraft,headRefName,baseRefName,headRefOid,baseRefOid,mergeable,reviewDecision,statusCheckRollup --limit 20`
- `node dist/cli/src/index.js validate --root . --json`
- `git diff --check`

## Stop Conditions

- Any future merge requires refreshed PR evidence and a separate approval gate.
- Any revert requires a separate high-risk revert governance queue.
