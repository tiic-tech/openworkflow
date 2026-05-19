# M12 Acceptance

M12 is accepted when OpenWorkflow's initialized state is minimal, Codex slash
commands are installed on Codex's real prompt surface, and `/ow:design` is
defined as the bridge from accepted prototype evidence to product development.

## Required Checks

- `npm run build`
- `npm run smoke:init`
- `node dist/cli/src/index.js sync --root /tmp/openworkflow-m04-smoke --tools codex`
- `node dist/cli/src/index.js doctor --root /tmp/openworkflow-m04-smoke --tools codex`
- `npm run validate:cli`
- `npm run validate`
- `npm run verify:m12`

## Product Checks

- A fresh init under `.openworkflow/` contains only `config.yaml`, `workflow/`, and `audit/`.
- Stage directories are created by stage commands later, not by init.
- Codex command prompts are written to `$CODEX_HOME/prompts/ow-*.md`.
- Repo-local `.codex/commands/ow/*.md` files are references, not the assumed slash registration source.
- Interactive command instructions tell agents to ask the user one clear question without narrating routine file reads/writes.
- `/ow:design` has a compact required `PRODUCT_DESIGN.yaml` contract and conditional deeper design packets.
