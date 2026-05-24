# G017 - Read-Only Autonomous Git Simulator

## Goal

Build the simulator stage required before any autonomous remote pilot. The
simulator must produce a complete autonomous operation plan without mutating
local or remote refs.

## Do

- Read local git state and queue evidence.
- Analyze base ref to HEAD ordered commits.
- Report dirty paths, branch-boundary state, validation evidence, PR-ready
  summary state, blockers, warnings, simulated plan, and rollback plan.
- Expose `openworkflow git-automation simulate`.
- Verify that simulator output reports `mutation_performed: false`.

## Do Not

- Do not push.
- Do not create or update PRs.
- Do not merge.
- Do not mutate GitHub Issues.
- Do not resolve conflicts automatically.

## Validation

- `npm run validate`
- `git diff --check`
- `npm run verify:runtime-surface`
