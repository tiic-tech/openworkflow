# C001 - M71 Publication Preflight

## Goal

Refresh current read-only facts for publishing the M71 historical branch before
any push or draft PR approval packet is considered.

## Read First

- `changes/M122-m71-historical-stack-publication/CANDIDATE_CHANGES.yaml`
- `changes/M71-git-version-control-governance/PR_READY_SUMMARY.md`
- `changes/M120-historical-branch-repair/C005-repaired-publication-order/PUBLICATION_ORDER.md`
- `references/git-version-control-governance.md`
- `references/gh-operation-governance.md`

## Do

- Verify the local M71 branch and PR-ready summary.
- Verify `origin/main` ancestry and ahead count.
- Check remote branch and existing PR state.
- Record whether the branch can proceed to a high-risk push decision.

## Do Not

- Do not push M71.
- Do not create a draft PR.
- Do not mark any PR ready for review.
- Do not merge, edit, close, retarget, or comment on any PR.
- Do not mutate Issues, force-push, rebase, reset, cherry-pick, split branches, or delete branches.

## Owned Paths

- `changes/M122-m71-historical-stack-publication/`

## Validation

- `git status --short --branch`
- `git rev-parse origin/main codex/m71-git-version-governance`
- `git merge-base origin/main codex/m71-git-version-governance`
- `git rev-list --count origin/main..codex/m71-git-version-governance`
- `git merge-base --is-ancestor origin/main codex/m71-git-version-governance`
- `git merge-tree origin/main codex/m71-git-version-governance`
- `git ls-remote --heads origin codex/m71-git-version-governance`
- `gh pr list --repo tiic-tech/openworkflow --head codex/m71-git-version-governance --state all --json number,url,state,isDraft,title,headRefName,baseRefName,headRefOid,baseRefOid`
- `git diff --check`

## Stop Conditions

- Stop before any remote mutation.
- Stop if remote branch or PR state changes before C002.
