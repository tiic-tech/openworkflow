# M117 C002 Implementation Brief

Extend the existing M114 branch identity invariant from commit/resume into all
queue-bound git-automation readiness modes.

## Goal

`git-automation branch`, `remote-plan`, `simulate`, and `draft-pr` must expose
whether the current branch matches the queue boundary and whether that boundary
actually owns the plan token. Stale branch identities should fail closed unless
the queue records an explicit temporary continuation exception for the exact
operation.

## Constraints

- Do not enable push, PR mutation, Issue mutation, merge, rebase, reset, or
  force-push.
- Do not change remote mutation permissions.
- Do not hand-edit generated `.agents/**` or `.openworkflow/**` surfaces.
- Keep C003 draft PR approval hardening and C004 merge-conflict checkpoints out
  of this change.

## Expected Shape

- Reuse `assessBranchIdentity` and `branchIdentityExceptionFrom`.
- Add branch identity fields to remote-plan, simulator, and draft-pr result
  payloads.
- Add branch automation identity reporting and fail-closed behavior for branch
  boundaries that name another plan id.
- Add one targeted RED/GREEN fixture for stale branch identity in remote
  readiness.
- Complete through `git-automation commit` with local commit evidence.
