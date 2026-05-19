# M17 Acceptance

M17 is accepted when OpenWorkflow supports prototype iteration through a
user-facing tune command while preserving decision records as internal audit
artifacts.

## User-Facing Behavior

- `/ow:tune` defaults to tuning the current prototype.
- `/ow:tune:proto` is an explicit prototype-tune route.
- `/ow:tune:<target>` has a documented target-routing contract.
- Users do not need to manually invoke `/ow:decision` during normal proto/tune
  loops.
- If no current prototype exists but a current validation target exists, tune
  can orchestrate prototype creation through proto behavior.

## Audit Behavior

- `/ow:decision` remains an internal audit command and artifact producer.
- `/ow:proto` and `/ow:tune` require automatic decision audit recording.
- Decision outcomes include `revise`.
- `revise` is used when the user requests another tuning pass, not when evidence
  is merely insufficient.

## Runtime Surface

- Codex init/sync generates `.agents/skills/ow-tune/SKILL.md`.
- Generated `ow-tune` uses XML output isolation, including `<inner_thinking>`.
- Runtime verification checks tune generation and internal decision behavior.
- Normal proto/tune handoffs do not expose manual decision as the main next
  command.

## Validation

- `npm run build` passes.
- `npm run validate` passes.
- `npm run verify:runtime-surface` passes.
- `npm run smoke:init` passes.
- `node dist/cli/src/index.js sync --root /tmp/openworkflow-m04-smoke --tools codex` passes.
- `node dist/cli/src/index.js doctor --root /tmp/openworkflow-m04-smoke --tools codex` passes.
- `npm run validate:cli` passes.
