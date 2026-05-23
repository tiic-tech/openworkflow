# M122 C003 Approved M71 Push Evidence

## Approval

Approval source: `user_input:2026-05-23-approved-m71-push-command`

Approved command:

```bash
git -C /Users/archy/Projects/StartUp/openworkflow-m71-publish push origin HEAD:refs/heads/codex/m71-git-version-governance
```

## Pre-Push State

- Worktree: `/Users/archy/Projects/StartUp/openworkflow-m71-publish`
- Worktree branch: `codex/m71-git-version-governance`
- Worktree status: clean
- Local HEAD: `a0ddcf94b0f856a92218ef07fd323d3eb5bae0a1`
- `origin/main`: `d0e13f4bba3a847b763d2db3f771659aac3a4fe5`
- Remote target branch before push: absent
- Existing PRs for head `codex/m71-git-version-governance` before push: none

## Push Result

- Pushed at: `2026-05-23T21:46:44+08:00`
- Exit code: `0`
- Resulting remote ref: `refs/heads/codex/m71-git-version-governance`
- Resulting remote head: `a0ddcf94b0f856a92218ef07fd323d3eb5bae0a1`
- GitHub PR suggestion:
  `https://github.com/tiic-tech/openworkflow/pull/new/codex/m71-git-version-governance`

## Post-Push Checks

- `git ls-remote --heads origin codex/m71-git-version-governance` returned
  `a0ddcf94b0f856a92218ef07fd323d3eb5bae0a1`.
- `gh pr list --repo tiic-tech/openworkflow --head codex/m71-git-version-governance --state all` returned no PRs.

## Unauthorized Operations

None.

Not performed:

- draft PR creation
- PR ready-for-review transition
- merge
- PR edit, close, retarget, or comment
- Issue mutation
- rebase, reset, force-push, branch deletion, or branch split

## Rollback Guidance

Prefer a follow-up revert PR after review if the branch should not land. Do not
delete the remote branch, force-push, close PRs, or mutate Issues without a new
exact approval.

## Next Gate

C004 draft PR creation is now ready but unapproved. It requires separate exact
approval before any `gh pr create` command is run.
