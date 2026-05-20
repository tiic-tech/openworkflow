# M53 Acceptance

- The repository is on a fresh M53 branch based on merged `main`.
- `npm run build` succeeds before running local init.
- Local CLI init creates `.openworkflow/`, `.agents/skills`, Codex adapter metadata, and AGENTS.md managed guidance.
- Init output respects minimal setup and does not create optional stage artifacts such as proto/spec/change/team outputs.
- Committed self-dogfood files are limited to source-level managed surfaces; runtime/cache policy is explicit.
- `doctor --json`, `handoff --json`, and `context --handoff --json` produce usable Agent-first entry reports after init.
- The final diff is reviewable as a bootstrap change, not mixed with unrelated feature work.

Validation target:

```bash
npm run build
node dist/cli/src/index.js init . --tools codex --json
node dist/cli/src/index.js doctor --json
node dist/cli/src/index.js handoff --json
node dist/cli/src/index.js context --handoff --json
```
