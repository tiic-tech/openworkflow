# M121 C003 Approved M117 Branch Push Evidence

## Summary

The user approved the exact M117 push command, and the M117 branch was pushed to
`origin` from the isolated M117 worktree. No PR was created or edited, no Issue
was mutated, no merge was performed, and no force-push, rebase, reset, or branch
deletion was performed.

## Approval

- Approval source: user message `批准push命令`
- Approval interpreted as: approve only the exact push command previously shown
- Approved command:

```bash
git -C /Users/archy/Projects/StartUp/openworkflow-m117-publish push origin HEAD:refs/heads/codex/m117-git-automation-remote-readiness
```

Draft PR creation remains a separate C004 approval gate.

## Pre-Push State

- Main worktree branch: `codex/m121-m117-remote-publication`
- Main worktree status: clean
- Isolated worktree path: `/Users/archy/Projects/StartUp/openworkflow-m117-publish`
- Isolated worktree branch: `codex/m117-git-automation-remote-readiness`
- Isolated worktree status: clean
- Local M117 HEAD: `898f0152a4e3e026ee5dcc78d4ef585c722a37b7`
- Previous remote branch state: absent

Pre-push read-only checks:

```bash
git status --short --branch
git -C /Users/archy/Projects/StartUp/openworkflow-m117-publish status --short --branch
git -C /Users/archy/Projects/StartUp/openworkflow-m117-publish rev-parse HEAD
git ls-remote --heads origin codex/m117-git-automation-remote-readiness
```

## Push Result

Command executed:

```bash
git -C /Users/archy/Projects/StartUp/openworkflow-m117-publish push origin HEAD:refs/heads/codex/m117-git-automation-remote-readiness
```

Result:

- Exit code: `0`
- Remote branch created: `origin/codex/m117-git-automation-remote-readiness`
- Remote branch HEAD: `898f0152a4e3e026ee5dcc78d4ef585c722a37b7`
- Timestamp: `2026-05-23T20:13:12+08:00`
- GitHub PR suggestion URL returned by remote:
  `https://github.com/tiic-tech/openworkflow/pull/new/codex/m117-git-automation-remote-readiness`

Post-push verification:

```bash
git ls-remote --heads origin codex/m117-git-automation-remote-readiness
gh pr list --repo tiic-tech/openworkflow --head codex/m117-git-automation-remote-readiness --base main --json number,url,state,isDraft,title,headRefName,baseRefName
```

Post-push evidence:

- Remote ref: `898f0152a4e3e026ee5dcc78d4ef585c722a37b7 refs/heads/codex/m117-git-automation-remote-readiness`
- Existing PRs after push: `[]`

## Rollback Guidance

Rollback preference remains a follow-up revert PR after review. Do not delete the
remote branch, force-push, rewrite history, close PRs, or mutate Issues without a
new high-risk decision report and exact operation-level approval.

## Next Gate

C004 may create a draft PR from
`codex/m117-git-automation-remote-readiness` into `main`, but only after a
separate exact approval for PR creation.
