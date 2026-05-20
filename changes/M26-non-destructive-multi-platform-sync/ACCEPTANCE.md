# M26 Acceptance

- `openworkflow sync` is no longer Codex-only in design; it uses a registry-driven platform adapter model with Codex as the first supported adapter.
- `sync` detects current project platforms from `.openworkflow/config.yaml` and managed adapter surfaces when `--tools` is omitted or set to `auto`.
- `sync --tools codex` explicitly syncs Codex only.
- Workflow sync adds or refreshes managed workflow-level files from the current package version without creating uninvoked stage artifacts.
- Existing user artifacts and notes are preserved.
- The sync report separates workflow updates from per-platform adapter updates.
- `doctor` can report managed workflow drift and adapter drift.
- Regression coverage proves an older project can be upgraded non-destructively.

Validation target:

```bash
npm run validate
npm run verify:runtime-surface
npm run verify:e2e-workflow
npm run verify:clean
npm run smoke:init
npm run validate:cli
```
