# C005 Implementation Brief

Correct M85's validation boundary decision.

When `/ow:proto` is invoked and no current validation artifact exists, the
agent should not proceed with ephemeral `vision_only` validation context. It
must first run an equivalent validation pass and write durable validation
artifacts.

## Required Behavior

- Missing `CURRENT_STATE.current_validation` before `/ow:proto` is a
  `missing_validation` preflight blocker.
- The next action is to auto-run `/ow:validation` and write
  `VALIDATION.yaml`, `NOTE.md`, and `VALIDATION_INDEX.yaml`.
- Auto-created validation artifacts record:
  - `trigger.mode: agent_auto`
  - `trigger.requested_command: /ow:proto`
  - `trigger.reason: missing_current_validation`
- Explicit user validation records `trigger.mode: user_explicit`.

## Out Of Scope

- Do not implement prototype prompt generation in this change.
- Do not generate real `.openworkflow/validation/**` artifacts in the repo.
