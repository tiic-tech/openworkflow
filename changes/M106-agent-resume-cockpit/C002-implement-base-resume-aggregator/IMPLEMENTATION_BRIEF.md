# M106 C002 Implementation Brief

## Goal

Implement the read-only base `resume` command so a fresh Agent can run
`resume --json` and receive a useful recovery packet without broad repository
rediscovery.

## Read First

- `changes/M106-agent-resume-cockpit/CANDIDATE_CHANGES.yaml`
- `changes/M106-agent-resume-cockpit/C002-implement-base-resume-aggregator/SELECTED_CHANGE.yaml`
- `references/planning-artifact-contracts.md`
- `packages/cli/src/commands/handoff.ts`
- `packages/cli/src/commands/inspect.ts`
- `packages/cli/src/commands/brief.ts`
- `packages/cli/src/index.ts`

## Do

- Add a `resume` CLI entrypoint with `--json` support.
- Reuse existing read models where practical; do not duplicate trust policy.
- Include project overview, trust state, workflow state, git cleanliness,
  command boundary, explicit queue/work-item uncertainty, and next actions.
- Keep the command read-only.

## Do Not

- Do not implement active queue scanning; C003 owns that.
- Do not mutate `CURRENT_STATE`, summaries, queues, git state, or generated
  adapter surfaces.
- Do not implement write preflight or broad product-alignment scoring.

## Owned Paths

- `packages/cli/src/`
- `packages/core/src/workflow/`
- `packages/cli/src/dev/verifyRuntimeSurface.ts`
- `changes/M106-agent-resume-cockpit/`

## Validation

- `npm run build`
- `npm run verify:runtime-surface`
- `node dist/cli/src/index.js resume --root . --json`
- `git diff --check`

## Stop Conditions

- The implementation needs queue scanning heuristics to be useful.
- The command would write or repair state.
- Existing handoff/inspect/check semantics need to change to make resume pass.
