# C001 - Shared M101 Publication Inventory

## Goal

Refresh current read-only facts for the shared M101-derived branch group before
any shared-stack publication or split/surgery decision is considered.

## Read First

- `changes/M124-shared-branch-publication-strategy/CANDIDATE_CHANGES.yaml`
- `changes/M105-m104-direct-trust-gate-fixes/PR_READY_SUMMARY.md`
- `changes/M106-agent-resume-cockpit/PR_READY_SUMMARY.md`
- `changes/M115-internal-coder-quality-governance/PR_READY_SUMMARY.md`
- `changes/M120-historical-branch-repair/C005-repaired-publication-order/PUBLICATION_ORDER.md`
- `references/git-version-control-governance.md`
- `references/gh-operation-governance.md`

## Do

- Verify the local shared M101 branch and PR-ready summaries.
- Verify `origin/main` ancestry and ahead count.
- Check remote branch and existing PR state.
- Record whether the branch can proceed to a high-risk shared-stack versus split decision.

## Do Not

- Do not push the shared M101 branch.
- Do not create a draft PR.
- Do not mark any PR ready for review.
- Do not perform branch split surgery, cherry-pick, rebase, reset, force-push, branch deletion, branch pointer moves, PR edit/close, Issue mutation, or merge.

## Owned Paths

- `changes/M124-shared-branch-publication-strategy/`

## Validation

- `git status --short --branch`
- `git rev-parse origin/main codex/m101-build-proto-prompt-command-split`
- `git merge-base origin/main codex/m101-build-proto-prompt-command-split`
- `git rev-list --count origin/main..codex/m101-build-proto-prompt-command-split`
- `git merge-base --is-ancestor origin/main codex/m101-build-proto-prompt-command-split`
- `git merge-tree --write-tree origin/main codex/m101-build-proto-prompt-command-split`
- `git ls-remote --heads origin codex/m101-build-proto-prompt-command-split`
- `gh pr list --repo tiic-tech/openworkflow --head codex/m101-build-proto-prompt-command-split --state all --json number,url,state,isDraft,title,headRefName,baseRefName,headRefOid,baseRefOid`
- `git diff --check`

## Stop Conditions

- Stop before any remote mutation.
- Stop before any branch surgery or destructive git operation.
- Stop if remote branch or PR state changes before C002.
