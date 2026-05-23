# M122 C004 Approved M71 Draft PR Evidence

## Summary

The user approved draft PR creation for the already-pushed M71 branch. One
draft PR was created from `codex/m71-git-version-governance` into `main`. No PR
was marked ready for review, no PR was merged, no Issue was mutated, and no
additional branch push or destructive git operation was performed.

## Approval

- Approval source: `user_input:2026-05-23-approved-draft-pr`
- Approval interpreted as: create one M71 draft PR into `main`
- Approved command:

```bash
gh pr create --repo tiic-tech/openworkflow --head codex/m71-git-version-governance --base main --draft --title "M71: Git version control governance" --body-file changes/M122-m71-historical-stack-publication/C004-draft-pr-approval-packet/PR_BODY.md
```

## Pre-PR State

- M122 worktree branch: `codex/m122-m71-historical-stack-publication`
- Remote branch:
  `a0ddcf94b0f856a92218ef07fd323d3eb5bae0a1 refs/heads/codex/m71-git-version-governance`
- Existing M71 PRs before creation: `[]`
- PR body source:
  `changes/M122-m71-historical-stack-publication/C004-draft-pr-approval-packet/PR_BODY.md`

## PR Result

- PR number: `6`
- PR URL: `https://github.com/tiic-tech/openworkflow/pull/6`
- PR state: `OPEN`
- Draft: `true`
- Title: `M71: Git version control governance`
- Head ref: `codex/m71-git-version-governance`
- Head OID: `a0ddcf94b0f856a92218ef07fd323d3eb5bae0a1`
- Base ref: `main`
- Base OID: `d0e13f4bba3a847b763d2db3f771659aac3a4fe5`
- Mergeability signal: `MERGEABLE`
- Created at audit timestamp: `2026-05-23T21:54:32+08:00`

Post-create verification:

```bash
gh pr view 6 --repo tiic-tech/openworkflow --json number,url,state,isDraft,title,headRefName,baseRefName,headRefOid,baseRefOid,mergeable,reviewDecision,statusCheckRollup
gh pr list --repo tiic-tech/openworkflow --head codex/m71-git-version-governance --base main --state all --json number,url,state,isDraft,title,headRefName,baseRefName,headRefOid,baseRefOid
```

## Unauthorized Operations Check

Not performed:

- ready-for-review conversion
- merge
- PR edit after creation
- PR close
- Issue mutation
- additional push
- force-push
- remote branch deletion
- rebase, reset, or history rewrite

## Rollback Guidance

If the draft PR must be withdrawn, close PR #6 only after a separate exact
approval. Do not delete the remote branch or force-push without a new high-risk
decision report and exact approval.

## Next Gate

C005 should record the M71 publication audit and next governance handoff.
Marking PR #6 ready for review remains out of scope and requires a separate
approval path.
