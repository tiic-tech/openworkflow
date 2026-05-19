# M10 Acceptance

M10 is accepted when the discovery loop has explicit artifact contracts that
support progressive disclosure and low-context agent resumption.

## Required Checks

- `npm run build`
- `npm run smoke:init`
- `node dist/cli/src/index.js sync --root /tmp/openworkflow-m04-smoke --tools codex`
- `node dist/cli/src/index.js doctor --root /tmp/openworkflow-m04-smoke --tools codex`
- `npm run validate:cli`
- `npm run validate`

## Product Checks

- Target repos initialized by the CLI contain `.openworkflow/audit/ARTIFACT_CONTRACTS.yaml`.
- Target repos initialized by the CLI contain `.openworkflow/audit/DISCLOSURE_LEVELS.yaml`.
- `/ow:vision`, `/ow:validation`, `/ow:prototype`, and `/ow:decision` generated commands name their artifact contracts.
- Artifact contracts distinguish machine YAML, short Markdown notes, optional generated HTML review surfaces, and raw evidence.
- Agents can decide what to load first from Level 0 and Level 1 indexes without reading stage folders recursively.
