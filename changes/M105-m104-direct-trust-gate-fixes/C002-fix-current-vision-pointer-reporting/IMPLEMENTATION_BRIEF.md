# M105 C002 Implementation Brief

## Objective

Fix the M104 pointer display bug:

- vision registration writes or preserves `current_session`
- summaries correctly identify the current vision session
- handoff `active_pointers.current_vision` still reports `null`

The Agent-facing handoff should not imply there is no current vision when a
current vision session is registered and trusted.

## Preferred Fix

Prefer adapting the active pointer read model to understand vision
`current_session`, or setting `current_vision` consistently when registering a
vision session. Avoid redesigning the vision artifact contract.

## Validation

Run:

- `npm run build`
- `npm run verify:runtime-surface`
- `node dist/cli/src/index.js validate --root . --json`
- `node dist/cli/src/index.js handoff --root . --json`
- `git diff --check`
