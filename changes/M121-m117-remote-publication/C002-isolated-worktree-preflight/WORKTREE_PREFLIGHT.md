# M121 C002 Isolated Worktree Preflight Spike

## Summary

The approved C002 narrow spike created an isolated M117 worktree and ran
read-only publication checks from an M117 branch context. No push, PR operation,
Issue mutation, merge, rebase, reset, force-push, branch deletion, or product
source edit was performed.

## Approval Boundary

User approval received: `可以，先做`

Interpreted scope: approve the recommended C002 narrow isolated-worktree
preflight spike only. This was not interpreted as approval to push.

## Worktree

- Path: `/Users/archy/Projects/StartUp/openworkflow-m117-publish`
- Branch: `codex/m117-git-automation-remote-readiness`
- HEAD: `898f0152a4e3e026ee5dcc78d4ef585c722a37b7`
- Worktree status: clean

The first attempt to run the CLI from the M117 worktree failed because that old
branch does not contain `dist/cli/src/index.js`. The successful checks used the
current M121 dist CLI with `--root` pointed at the M117 worktree, preserving the
M117 git branch context.

## Read-Only Checks

### Branch And Remote

- M117 worktree current branch: `codex/m117-git-automation-remote-readiness`
- M117 worktree HEAD: `898f0152a4e3e026ee5dcc78d4ef585c722a37b7`
- Remote branch `origin/codex/m117-git-automation-remote-readiness`: absent
- Existing PR for M117 into `main`: none
- Merge-tree conflict probe: clean

### Remote Plan

Command:

```bash
node /Users/archy/Projects/StartUp/openworkflow/dist/cli/src/index.js git-automation remote-plan --root /Users/archy/Projects/StartUp/openworkflow-m117-publish --queue changes/M117-git-automation-remote-readiness/CANDIDATE_CHANGES.yaml --base origin/main --remote origin --target-base main --json
```

Result:

- `ok:false`
- Mutation performed: false
- Current branch: `codex/m117-git-automation-remote-readiness`
- Branch boundary: `codex/m117-git-automation-remote-readiness`
- Branch matches current: true
- Branch owns plan: true
- Dirty paths: none
- Remote branch head: absent
- Merge readiness: fast-forward, conflict probe clean

Remaining blocker:

- `simulator evidence is missing`

Cleared blocker:

- current branch mismatch is cleared in the isolated worktree.

### Simulator

Command:

```bash
node /Users/archy/Projects/StartUp/openworkflow/dist/cli/src/index.js git-automation simulate --root /Users/archy/Projects/StartUp/openworkflow-m117-publish --queue changes/M117-git-automation-remote-readiness/CANDIDATE_CHANGES.yaml --base main --json
```

Result:

- `ok:true`
- Mutation performed: false
- Current branch: `codex/m117-git-automation-remote-readiness`
- Branch boundary: `codex/m117-git-automation-remote-readiness`
- Branch matches current: true
- Branch owns plan: true
- Dirty paths: none
- Blockers: none
- Remote branch head: unknown/absent
- Merge readiness: fast-forward, conflict probe clean

## Interpretation

The isolated worktree model is valid for M117 publication preflight. It clears
the branch identity blocker that appeared when commands were run from the M121
governance branch.

The only remaining remote-plan blocker is `simulator evidence is missing`.
Because a fresh simulator run from the M117 worktree is `ok:true`, this is now a
remote-plan evidence-binding gap rather than a simulator failure.

## Next Gate

Before any push, the user must explicitly approve the exact C003 push command:

```bash
git -C /Users/archy/Projects/StartUp/openworkflow-m117-publish push origin HEAD:refs/heads/codex/m117-git-automation-remote-readiness
```

This command remains unapproved.

Draft PR creation remains a separate approval gate after a successful push.
