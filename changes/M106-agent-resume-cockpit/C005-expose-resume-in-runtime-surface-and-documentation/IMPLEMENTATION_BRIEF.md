# M106 C005 Implementation Brief

## Goal

Expose `resume --json` as the documented first recovery command for a fresh
Agent after interrupted sessions, and verify that the runtime surface and
source-generated Agent guidance keep that distinction discoverable.

## Read First

- `changes/M106-agent-resume-cockpit/CANDIDATE_CHANGES.yaml`
- `changes/M106-agent-resume-cockpit/C005-expose-resume-in-runtime-surface-and-documentation/SELECTED_CHANGE.yaml`
- `AGENTS.md`
- `packages/core/src/onboarding/`
- `AGENTS.md`
- `packages/core/src/commands/registry.ts`
- `packages/cli/src/commands/resume.ts`
- `packages/cli/src/index.ts`
- `packages/cli/src/dev/verifyRuntimeSurface.ts`

## Do

- Update source guidance, not generated adapter files by hand.
- Tell Agents to use `resume --root . --json` when a session restarts after
  network loss, context overflow, compaction failure, or unexpected
  termination.
- Distinguish resume from handoff, context, inspect, and status.
- Frame resume as minimal-context precision recovery into ranked atom-task
  continuation with explicit boundaries and product-alignment signals.
- Document future project SOUL/MEMORY as deferred and separate from resume.

## Do Not

- Do not change `CURRENT_STATE.next_command`.
- Do not hand-edit generated `.agents/**` or `.openworkflow/**`.
- Do not add write preflight, lineage graph, drift scoring, or SOUL/MEMORY
  implementation.
- Do not perform remote git or PR automation.

## Owned Paths

- `packages/core/src/commands/registry.ts`
- `packages/cli/src/commands/resume.ts`
- `packages/cli/src/index.ts`
- `packages/core/src/onboarding/`
- `packages/cli/src/dev/verifyRuntimeSurface.ts`
- `docs/`
- `changes/M106-agent-resume-cockpit/`

## Validation

- `npm run build`
- `npm run verify:runtime-surface`
- `node dist/cli/src/index.js resume --root . --json`
- `node dist/cli/src/index.js handoff --root . --json`
- `node dist/cli/src/index.js validate --root . --json`
- `node dist/cli/src/index.js summaries --root . --strict --json`
- `git diff --check`

## Stop Conditions

- The change requires mutating workflow state from resume.
- The change requires generated adapter edits that cannot be reproduced from
  source.
- The change starts implementing project SOUL/MEMORY rather than documenting it
  as deferred.
