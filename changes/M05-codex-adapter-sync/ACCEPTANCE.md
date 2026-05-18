# M05 Acceptance

M05 is accepted when OpenWorkflow can initialize and maintain a Codex adapter
surface without treating `.codex/` as the product source of truth.

## Required checks

- `npm run build`
- `npm run smoke:init`
- `node dist/cli/src/index.js sync --root /tmp/openworkflow-m04-smoke --tools codex`
- `node dist/cli/src/index.js doctor --root /tmp/openworkflow-m04-smoke --tools codex`
- `npm run validate:cli`
- `npm run validate`

## Product checks

- `.openworkflow/config.yaml` records adapter policy.
- `.openworkflow/adapters/codex.yaml` records generated Codex files.
- Generated `.codex` files include `generated-by`, adapter version, and template id.
- Sync refreshes generated files from packaged templates.
- Doctor reports missing or stale generated files.
