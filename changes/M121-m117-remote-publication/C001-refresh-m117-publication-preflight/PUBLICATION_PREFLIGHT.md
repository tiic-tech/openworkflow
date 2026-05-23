# M121 C001 M117 Publication Preflight

## Summary

C001 refreshed the M117 publication facts from the M121 governance branch. No
remote mutation, branch pointer mutation, PR operation, Issue mutation, merge,
rebase, reset, force-push, or branch deletion was performed.

## Target

- Plan: `M117-git-automation-remote-readiness`
- Local branch: `codex/m117-git-automation-remote-readiness`
- Local branch head: `898f0152a4e3e026ee5dcc78d4ef585c722a37b7`
- Target remote: `origin`
- Target base: `main`
- `origin/main`: `d0e13f4bba3a847b763d2db3f771659aac3a4fe5`
- Merge base with `origin/main`: `d0e13f4bba3a847b763d2db3f771659aac3a4fe5`
- Commits ahead of `origin/main`: 263

## Local Evidence

- M117 branch-local `PR_READY_SUMMARY.md`: present
- M117 summary repair commit: `898f0152a4e3e026ee5dcc78d4ef585c722a37b7`
- `origin/main` is an ancestor of the M117 branch: yes
- Conflict probe: `git merge-tree --write-tree origin/main codex/m117-git-automation-remote-readiness`
- Conflict probe result: clean

## Remote And PR State

- Remote branch `origin/codex/m117-git-automation-remote-readiness`: absent
- Existing PR for M117 into `main`: none
- `gh pr list` result: `[]`

## Git-Automation Read-Only Results From M121

`git-automation remote-plan` against the M117 queue from the M121 branch returned
`ok:false` without mutating remote state.

Blockers:

- current branch `codex/m121-m117-remote-publication` does not match M117 branch boundary `codex/m117-git-automation-remote-readiness`
- simulator evidence is missing

Warnings:

- remote branch head is absent or unreadable for `origin/codex/m117-git-automation-remote-readiness`
- command was read-only and did not push, create PRs, edit PRs, merge, or mutate Issues

`git-automation simulate` against the M117 queue from the M121 branch returned
`ok:false` without mutating remote state.

Blockers:

- current branch `codex/m121-m117-remote-publication` does not match M117 branch boundary `codex/m117-git-automation-remote-readiness`

Warnings:

- remote branch head is unknown for `origin/codex/m117-git-automation-remote-readiness`
- simulator was read-only and did not push, create PRs, merge, or mutate Issues

## Interpretation

The M117 branch remains the intended publication target, but the M121 governance
branch is not the M117 branch. The branch mismatch is expected from this
governance context and should not be bypassed silently.

The local merge-readiness facts are favorable: `origin/main` is the merge base,
the M117 branch is fast-forward relative to `origin/main`, and the merge-tree
conflict probe is clean. The remote branch and PR do not exist yet.

The remaining `remote-plan` blocker `simulator evidence is missing` is a binding
gap in the remote-plan evidence model. Fresh simulator execution from the M121
branch cannot clear it because the simulator also enforces current-branch
identity. C002 must decide whether publication requires a fresh simulator run
from an M117-checked-out context before push approval.

## Chosen Execution Model For Later Candidates

Use an isolated M117 worktree for future C002/C003 preflight and any approved
push.

Rationale:

- It keeps the M121 governance branch available for evidence commits.
- It lets M117-specific `git-automation remote-plan` and `simulate` run with the
  current branch matching the M117 queue boundary.
- It avoids pushing from a governance branch with a target-branch refspec while
  branch-identity gates are still red.
- It avoids interrupting or dirtying the main working tree when recording M121
  governance evidence.

Future C002 should document the exact worktree path and commands before C003
can execute anything. A candidate command shape is:

```bash
git worktree add ../openworkflow-m117-publish codex/m117-git-automation-remote-readiness
git -C ../openworkflow-m117-publish push origin HEAD:refs/heads/codex/m117-git-automation-remote-readiness
```

These commands are not approved by C001.

## C002 Gate

C002 should produce `HIGH_RISK_DECISION_REPORT.md` for the exact M117 push
boundary before any remote mutation. The report should explicitly cover:

- isolated worktree creation and cleanup expectations
- fresh M117-context `remote-plan` and simulator evidence
- whether the simulator evidence binding gap is a blocker
- prior remote branch state, currently absent
- exact push command
- rollback guidance, preferring revert PR recovery over force-push
- stop before draft PR creation unless separately approved
