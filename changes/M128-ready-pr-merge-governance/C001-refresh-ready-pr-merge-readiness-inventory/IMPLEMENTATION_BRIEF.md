# C001 Refresh Ready PR Merge-Readiness Inventory

## Goal

Refresh read-only merge-readiness facts for PR #4, #5, #6, and #7 so M128 can decide the first merge target in C002.

## Read First

- `changes/M128-ready-pr-merge-governance/CANDIDATE_CHANGES.yaml`
- `changes/M128-ready-pr-merge-governance/SUMMARY.yaml`
- `references/git-version-control-governance.md`
- `references/gh-operation-governance.md`

## Do

- Capture current PR state, draft flag, head/base refs, OIDs, mergeability, review decision, and check rollup.
- Verify target remote branches match PR head OIDs.
- Run read-only ancestry and merge-tree probes against `origin/main`.
- Write `MERGE_READINESS_INVENTORY.md`.
- Update M128 queue status and validation evidence for C001.

## Do Not

- Do not merge any PR.
- Do not push, force-push, rebase, reset, delete branches, or switch branches.
- Do not edit, close, retarget, comment on, or request review for PRs.
- Do not mutate Issues or product source.

## Owned Paths

- `changes/M128-ready-pr-merge-governance/`

## Validation

- `gh pr list --repo tiic-tech/openworkflow --state open --json number,url,title,isDraft,headRefName,baseRefName,headRefOid,baseRefOid,mergeable,reviewDecision,statusCheckRollup --limit 20`
- `git ls-remote --heads origin codex/m102-selected-change-commit-gate codex/m117-git-automation-remote-readiness codex/m71-git-version-governance codex/m101-build-proto-prompt-command-split`
- `git merge-tree --write-tree origin/main <head-ref-or-oid>`
- `node dist/cli/src/index.js validate --root . --json`
- `git diff --check`

## Stop Conditions

- A target PR is no longer open or has changed head/base OID.
- A target remote branch is missing or differs from the PR head OID.
- A merge-tree probe reports conflicts.
- Any requested operation would mutate GitHub or local git history.
