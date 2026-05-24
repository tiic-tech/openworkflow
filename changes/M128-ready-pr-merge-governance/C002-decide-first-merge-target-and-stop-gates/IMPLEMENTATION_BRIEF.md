# C002 Decide First Merge Target And Stop Gates

## Goal

Use C001 inventory and current read-only evidence to choose exactly one first merge target for M128.

## Read First

- `changes/M128-ready-pr-merge-governance/C001-refresh-ready-pr-merge-readiness-inventory/MERGE_READINESS_INVENTORY.md`
- `changes/M128-ready-pr-merge-governance/CANDIDATE_CHANGES.yaml`
- `references/git-version-control-governance.md`
- `references/gh-operation-governance.md`

## Do

- Refresh current open PR metadata.
- Compare PR #4, #5, #6, and #7 by ancestry, commit count, review/check state, and blast radius.
- Write `FIRST_MERGE_TARGET_DECISION.md`.
- Record exact approval text needed before C003 can prepare a high-risk merge packet.

## Do Not

- Do not merge any PR.
- Do not push, force-push, rebase, reset, delete branches, or switch branches.
- Do not edit, close, retarget, comment on, or request review for PRs.
- Do not mutate Issues or product source.

## Owned Paths

- `changes/M128-ready-pr-merge-governance/`

## Validation

- `gh pr list --repo tiic-tech/openworkflow --state open --json number,url,title,isDraft,headRefName,baseRefName,headRefOid,baseRefOid,mergeable,reviewDecision,statusCheckRollup --limit 20`
- `git merge-base --is-ancestor <candidate-head> <other-head>`
- `node dist/cli/src/index.js validate --root . --json`
- `git diff --check`

## Stop Conditions

- PR #6 changes state, draft flag, mergeability, base, or head before C003.
- User asks for merge execution before C003 and exact C004 approval.
- Any operation would mutate GitHub or local git history.
