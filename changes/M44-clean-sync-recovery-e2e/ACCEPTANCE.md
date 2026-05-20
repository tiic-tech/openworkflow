# M44 Acceptance

- `verify:clean` covers `clean --yes` followed by `sync --json`.
- Sync restores managed `.openworkflow` runtime files, Codex adapter files, and the AGENTS.md managed block.
- Preserved source artifacts remain byte-for-byte unchanged after clean and sync.
- Recovered projects can run JSON Agent entrypoints for doctor and command readiness.
- Repository validation requires M44 contracts.

Validation target:

```bash
npm run build
npm run verify:clean
npm run validate
```
