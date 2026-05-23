# M71 Publication Preflight

Captured at: `2026-05-23T21:23:30+08:00`

## Scope

This packet is read-only evidence for M122. It does not approve or execute any
remote mutation.

## Commands Run

- `git status --short --branch`
- `git rev-parse origin/main codex/m71-git-version-governance`
- `git merge-base origin/main codex/m71-git-version-governance`
- `git rev-list --count origin/main..codex/m71-git-version-governance`
- `git merge-base --is-ancestor origin/main codex/m71-git-version-governance`
- `git merge-tree origin/main codex/m71-git-version-governance`
- `git ls-remote --heads origin codex/m71-git-version-governance`
- `gh pr list --repo tiic-tech/openworkflow --head codex/m71-git-version-governance --state all --json number,url,state,isDraft,title,headRefName,baseRefName,headRefOid,baseRefOid`

## Git State

- Current governance branch: `codex/m122-m71-historical-stack-publication`
- Target publication branch: `codex/m71-git-version-governance`
- Target branch head: `a0ddcf94b0f856a92218ef07fd323d3eb5bae0a1`
- Base branch: `origin/main`
- Base head: `d0e13f4bba3a847b763d2db3f771659aac3a4fe5`
- Merge base: `d0e13f4bba3a847b763d2db3f771659aac3a4fe5`
- Commits ahead of `origin/main`: `66`
- `origin/main` is ancestor of target branch: yes
- Conflict probe tree: `bbf7b9e12650cd3d984f7fa379e8ecd3871bf5e3`
- Working tree before edits: clean

## Remote State

- Remote target branch `origin/codex/m71-git-version-governance`: absent
- Existing PRs for head `codex/m71-git-version-governance`: none
- Branch-local PR-ready summary: present

## Recommendation

Proceed to C002: prepare a high-risk decision packet for the exact M71 branch
push and an execution model that avoids branch-identity confusion.

Reasoning:

- M71 is technically publication-ready as a single historical stack branch.
- The target branch is fast-forward from `origin/main` and has no current remote
  branch or PR.
- The branch-local `PR_READY_SUMMARY.md` exists and explicitly states that
  remote PR creation or mutation requires separate approval.
- Because M71 is a 66-commit historical stack, C002 must make the acceptance
  and exact push command explicit before any remote mutation.

## Stop Gates

- Do not push `codex/m71-git-version-governance` without exact approval.
- Do not create a draft PR without separate exact approval.
- Do not mark any PR ready for review.
- Do not merge, close, edit, retarget, or comment on any PR.
- Do not mutate Issues, push unrelated branches, force-push, rebase, reset,
  cherry-pick, split branches, or delete branches.
