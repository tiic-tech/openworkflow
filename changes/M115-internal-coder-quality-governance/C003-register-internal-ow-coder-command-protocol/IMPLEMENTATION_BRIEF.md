# C003 Implementation Brief

## Goal

Register `/ow:coder` as an internal command protocol through the source command
registry and source-driven Codex sync. The command must be Agent-only and must
not become a normal user-facing coding entrypoint.

## Read First

- `references/internal-coder-protocol.md`
- `skills/coder/SKILL.md`
- `references/skill-system-lifecycle.md`
- `packages/core/src/commands/registry.ts`
- `packages/adapters/codex/src/generateSkills.ts`
- `packages/cli/src/dev/verifyRuntimeSurface.ts`

## Do

- Add a `coder` command registry entry with aliases such as
  `code-quality-governor` and `engineering-quality`.
- Set command visibility to `internal`.
- Define protocol context and checkpoints for trust recovery, owner/file map,
  RED/GREEN evidence, post-write self-check, validation ladder, and evidence
  binding.
- Keep target artifacts empty or future-facing; do not require
  `CODER_EVIDENCE.yaml`.
- Run source-driven sync and verify generated coder surfaces.

## Do Not

- Do not expose `/ow:coder` as a user command or normal handoff.
- Do not replace `/ow:change` or `/ow:team`.
- Do not change CLI command execution semantics or public JSON shape.
- Do not create mandatory evidence schemas.

## Owned Paths

- `packages/core/src/commands/registry.ts`
- `packages/core/src/adapters/`
- `packages/cli/src/dev/verifyRuntimeSurface.ts`
- `skills/`
- `.agents/skills/`
- `changes/M115-internal-coder-quality-governance/`

## Validation

- `npm run build`
- `npm run verify:runtime-surface`
- `node dist/cli/src/index.js sync --root . --tools codex --json`
- `node dist/cli/src/index.js inspect --root . --strict --json`
- `git diff --check`

## Stop Conditions

- Stop if implementation requires public CLI JSON shape changes.
- Stop if `/ow:coder` must become user-facing to satisfy tests.
- Stop if mandatory coder evidence schema or enforcement becomes necessary.
