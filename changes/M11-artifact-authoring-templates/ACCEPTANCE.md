# M11 Acceptance

M11 is accepted when discovery artifacts can be authored from generated
templates and current workflow state can be resumed from active pointers without
scanning stage folders.

## Required Checks

- `npm run build`
- `npm run smoke:init`
- `node dist/cli/src/index.js sync --root /tmp/openworkflow-m04-smoke --tools codex`
- `node dist/cli/src/index.js doctor --root /tmp/openworkflow-m04-smoke --tools codex`
- `npm run validate:cli`
- `npm run validate`

## Product Checks

- Target repos initialized by the CLI contain discovery artifact templates under stage-local `_templates/` directories.
- `.openworkflow/audit/ARTIFACT_CONTRACTS.yaml` includes template path, active pointer, read policy, and context budget data.
- Generated `/ow:vision`, `/ow:validation`, `/ow:prototype`, and `/ow:decision` commands tell agents which template to use.
- A null active pointer is valid in a new repo.
- A non-null active pointer must match an indexed artifact id and the indexed path must exist.
