# M13 Acceptance

M13 is accepted when `init --tools codex` installs OpenWorkflow as Codex
repo-local Skills under `.agents/skills`, while `.openworkflow` remains the
minimal workflow source of truth.

## Required Checks

- `npm run build`
- `npm run validate`
- `npm run verify:runtime-surface`
- `npm run smoke:init`
- `node dist/cli/src/index.js sync --root /tmp/openworkflow-m04-smoke --tools codex`
- `node dist/cli/src/index.js doctor --root /tmp/openworkflow-m04-smoke --tools codex`
- `npm run validate:cli`

## Product Checks

- A fresh init under `.openworkflow/` contains only `config.yaml`, `workflow/`, and `audit/`.
- Codex skills are generated under `.agents/skills/ow-*`.
- Each generated skill has `SKILL.md` with `name` and `description` frontmatter.
- Each generated skill has `agents/openai.yaml` display metadata.
- No default global prompt files are written.
- No default `.codex/commands/ow` or `.codex/skills` files are written.
- Legacy generated prompt or `.codex` adapter files are removed when safe.
