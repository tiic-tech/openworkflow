# M09 Acceptance

M09 is accepted when the discovery loop is controlled by audit-first command
protocols and initialized target repos include enough audit structure for agents
to load minimal context at any stage.

## Required checks

- `npm run build`
- `npm run smoke:init`
- `node dist/cli/src/index.js sync --root /tmp/openworkflow-m04-smoke --tools codex`
- `node dist/cli/src/index.js doctor --root /tmp/openworkflow-m04-smoke --tools codex`
- `npm run validate:cli`
- `npm run validate`

## Product checks

- `/ow:vision`, `/ow:validation`, `/ow:prototype`, and `/ow:decision` have
  deep generated command protocols.
- Generated commands state required context, optional context, forbidden
  context, allowed outputs, forbidden outputs, audit checkpoints, and
  anti-patterns.
- Target repos initialized by the CLI contain `.openworkflow/audit/`.
- The audit files can be used to determine what each command should read and
  write without loading the entire repo.
- `/ow:spec`, `/ow:change`, and `/ow:team` remain intentionally shallow.
