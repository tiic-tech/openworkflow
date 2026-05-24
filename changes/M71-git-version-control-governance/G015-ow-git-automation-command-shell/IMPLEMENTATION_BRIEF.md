# G015 - ow:git-automation Command Shell

## Goal

Expose a managed git lifecycle shell without implementing autonomous remote
mutation.

## Approved Boundary

- Managed mode can automate local branch, local commit, and local PR-ready
  summary actions.
- Managed remote mode must produce an operation plan and refuse execution until
  the user approves a concrete remote operation.
- Autonomous mode is not implemented in G015; it is split into G016.

## Do

- Add CLI `openworkflow git-automation`.
- Add generated `/ow:git-automation` skill surface.
- Generate a managed remote plan with ordered local commits for push, PR, and
  merge handoff.
- Verify remote refusal and ordered commit output.

## Do Not

- Do not push.
- Do not create, edit, or merge remote PRs.
- Do not mutate GitHub Issues.
- Do not implement autonomous mode.
- Do not reset, rebase, force-push, or delete branches.

## Validation

- `npm run validate`
- `git diff --check`
- `npm run verify:runtime-surface`
