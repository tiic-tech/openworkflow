# M52 Acceptance

- After clean, default `sync --json` restores `.agents/openworkflow-adapter.yaml`.
- Default sync JSON explains Codex fallback evidence when no tools are detected.
- After default sync recovery, default `doctor --json` reports tools including `codex` and `adapter_ok:true`.
- `verify:agent-e2e` covers default sync recovery, not explicit `--tools codex` only.
- Repository validation requires M52 contracts.

Validation target:

```bash
npm run build
npm run verify:agent-e2e
npm run validate
```
