# M122 C002 Isolated Worktree Preflight

Captured at: `2026-05-23T21:40:46+08:00`

## Summary

The approved C002 narrow preflight created an isolated M71 worktree and ran
read-only publication checks from the target branch context. No push, PR
operation, Issue mutation, merge, rebase, reset, force-push, branch deletion, or
product source edit was performed.

## Approval Boundary

User approval received:

```text
Approve M122 C002 narrow preflight: select C002 and prepare local-only isolated execution preflight; do not push.
```

Interpreted scope: select C002 and prepare the local-only isolated execution
preflight. This is not approval to execute C003 push or create a draft PR.

## Worktree

- Path: `/Users/archy/Projects/StartUp/openworkflow-m71-publish`
- Branch: `codex/m71-git-version-governance`
- HEAD: `a0ddcf94b0f856a92218ef07fd323d3eb5bae0a1`
- Worktree status: clean

## Read-Only Checks

### Branch And Remote

- M71 worktree current branch: `codex/m71-git-version-governance`
- M71 worktree HEAD: `a0ddcf94b0f856a92218ef07fd323d3eb5bae0a1`
- `origin/main`: `d0e13f4bba3a847b763d2db3f771659aac3a4fe5`
- Remote branch `origin/codex/m71-git-version-governance`: absent
- Existing PRs for M71 into `main`: none
- Merge-tree conflict probe: clean, tree `bbf7b9e12650cd3d984f7fa379e8ecd3871bf5e3`

### Remote Plan

Command:

```bash
node /Users/archy/Projects/StartUp/openworkflow/dist/cli/src/index.js git-automation remote-plan --root /Users/archy/Projects/StartUp/openworkflow-m71-publish --queue changes/M71-git-version-control-governance/CANDIDATE_CHANGES.yaml --base origin/main --remote origin --target-base main --json
```

Result:

- `ok:true`
- Mutation performed: false
- Current branch: `codex/m71-git-version-governance`
- Branch boundary: `codex/m71-git-version-governance`
- Branch matches current: true
- Branch owns plan: true
- Dirty paths: none
- Remote branch head: absent
- Merge readiness: fast-forward, conflict probe clean
- Existing PRs: none

Warnings:

- Remote branch head is absent or unreadable for `origin/codex/m71-git-version-governance`.
- Command was read-only and did not push, create PRs, edit PRs, merge, or mutate Issues.

### Simulator

Command:

```bash
node /Users/archy/Projects/StartUp/openworkflow/dist/cli/src/index.js git-automation simulate --root /Users/archy/Projects/StartUp/openworkflow-m71-publish --queue changes/M71-git-version-control-governance/CANDIDATE_CHANGES.yaml --base main --json
```

Result:

- `ok:true`
- Mutation performed: false
- Current branch: `codex/m71-git-version-governance`
- Branch boundary: `codex/m71-git-version-governance`
- Branch matches current: true
- Branch owns plan: true
- Dirty paths: none
- Blockers: none
- Remote branch head: unknown/absent
- Merge readiness: fast-forward, conflict probe clean

## Interpretation

The isolated worktree model is valid for M71 publication preflight. It runs from
the M71 branch context, clears branch-identity risk for the later push, and keeps
the M122 governance branch separate from the target publication branch.

The remote branch is still absent, and no target-head PR exists. M71 remains a
66-commit historical stack, so the push must be an explicit, separately approved
operation.

## Next Gate

Before any push, the user must explicitly approve this exact C003 command:

```bash
git -C /Users/archy/Projects/StartUp/openworkflow-m71-publish push origin HEAD:refs/heads/codex/m71-git-version-governance
```

This command remains unapproved.

Draft PR creation remains a separate approval gate after a successful approved
branch push.
