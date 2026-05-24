# C004 Implementation Brief

## Goal

Wire internal coder governance into `/ow:change` planning and `/ow:team`
execution without turning `/ow:coder` into a user-facing command, replacing
those commands, or adding hard evidence enforcement.

## Read First

- `references/internal-coder-protocol.md`
- `skills/coder/SKILL.md`
- `packages/core/src/commands/registry.ts`
- `skills/select-change/`
- `skills/run-team/`
- `packages/cli/src/dev/verifyRuntimeSurface.ts`

## Do

- Add coder preflight expectations to change planning before selected
  implementation boundaries are finalized.
- Add RED/GREEN evidence and post-write self-check expectations to team
  execution before completion.
- Keep `/ow:change` responsible for planning and `/ow:team` responsible for
  execution.
- Add runtime-surface checks that generated change and team guidance references
  coder governance.
- Run source-driven sync for generated `.agents` and audit surfaces.

## Do Not

- Do not expose `/ow:coder` as a normal user-facing handoff command.
- Do not require `CODER_EVIDENCE.yaml` or any hard blocking evidence gate.
- Do not change public CLI JSON output.
- Do not hand-edit generated `.agents/**` or `.openworkflow/**` surfaces.

## Owned Paths

- `packages/core/src/commands/registry.ts`
- `skills/select-change/`
- `skills/run-team/`
- `packages/cli/src/dev/verifyRuntimeSurface.ts`
- `.agents/skills/ow-change/`
- `.agents/skills/ow-team/`
- `.openworkflow/audit/COMMAND_AUDIT_INDEX.yaml`
- `.openworkflow/audit/CONTEXT_PACKETS.yaml`
- `changes/M115-internal-coder-quality-governance/`

## Validation

- `npm run build`
- `npm run verify:runtime-surface`
- `node dist/cli/src/index.js sync --root . --tools codex --json`
- `git diff --check`

## Stop Conditions

- Stop if the change requires a public command identity change.
- Stop if hard evidence enforcement becomes necessary.
- Stop if generated surfaces need manual edits instead of source-driven sync.
