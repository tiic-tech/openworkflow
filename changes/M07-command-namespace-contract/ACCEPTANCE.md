# M07 Acceptance

M07 is accepted when OpenWorkflow has one stable user-facing command namespace:
`/ow:<command>`.

## Required checks

- `npm run build`
- `npm run smoke:init`
- `node dist/cli/src/index.js sync --root /tmp/openworkflow-m04-smoke --tools codex`
- `node dist/cli/src/index.js doctor --root /tmp/openworkflow-m04-smoke --tools codex`
- `npm run validate:cli`
- `npm run validate`

## Product checks

- Canonical commands are `/ow:workflow`, `/ow:context`, `/ow:vision`,
  `/ow:validation`, `/ow:prototype`, `/ow:decision`, `/ow:spec`,
  `/ow:change`, and `/ow:team`.
- Codex command files are generated under `.codex/commands/ow/`.
- The Codex manifest records canonical triggers and legacy triggers.
- Generated command content does not use legacy slash triggers such as
  `/build-vision` or `/run-team`.
- Repo-local skill and protocol references use `/ow:*` for user-facing command
  triggers.
