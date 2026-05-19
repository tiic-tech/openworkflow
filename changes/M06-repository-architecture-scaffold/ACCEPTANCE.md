# M06 Acceptance

M06 is accepted when the repository has the intended package structure for the
npm-first OpenWorkflow architecture while preserving the behavior delivered by
M04 and M05.

## Required checks

- `npm run build`
- `npm run smoke:init`
- `node dist/cli/src/index.js sync --root /tmp/openworkflow-m04-smoke --tools codex`
- `node dist/cli/src/index.js doctor --root /tmp/openworkflow-m04-smoke --tools codex`
- `npm run validate:cli`
- `npm run validate`

## Product checks

- `packages/cli/src/index.ts` is a thin dispatcher.
- CLI handlers live under `packages/cli/src/commands/`.
- Core modules live under `packages/core/src/contracts/`, `fs/`, `workflow/`, and `validators/`.
- Codex adapter code has separate modules for agents, commands, skills, template registry, sync, and doctor checks.
- `templates/openworkflow/` and `templates/codex/` exist as documented future template roots.
