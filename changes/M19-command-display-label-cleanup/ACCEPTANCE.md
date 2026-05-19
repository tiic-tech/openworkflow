# M19 Acceptance

M19 is accepted when Codex skill interface labels show `ow:<id>` instead of
`/ow:<id>` while the underlying OpenWorkflow command semantics remain unchanged.

## Required Outcomes

- Generated `agents/openai.yaml` files use `display_name: ow:<id>`.
- Generated interface files do not contain `display_name: /ow:<id>`.
- Generated `SKILL.md` files still document semantic commands such as
  `/ow:vision`.
- Runtime verification guards the display-name behavior.

## Validation

- `npm run build` passes.
- `npm run validate` passes.
- `npm run verify:runtime-surface` passes.
- `npm run smoke:init` passes.
- `node dist/cli/src/index.js sync --root /tmp/openworkflow-m04-smoke --tools codex` passes.
- `node dist/cli/src/index.js doctor --root /tmp/openworkflow-m04-smoke --tools codex` passes.
- `npm run validate:cli` passes.
