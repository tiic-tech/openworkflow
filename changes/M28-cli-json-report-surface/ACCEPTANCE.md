# M28 Acceptance

- All CLI commands support `--json`: `init`, `sync`, `doctor`, `validate`, `clean`, `brief`, and `status`.
- JSON stdout is pure parseable JSON.
- Every command returns the same envelope keys: `schema_version`, `command`, `ok`, `root`, `data`, `warnings`, `errors`, `effects`, and `next_actions`.
- Mutating commands report file effects under `effects`.
- Read/report commands put their primary result under `data`.
- Exit codes retain success/failure meaning.
- `openworkflow --help` and the AGENTS.md managed block mention JSON mode as the preferred Agent-consumable report format.

Validation target:

```bash
npm run validate
npm run verify:runtime-surface
npm run verify:e2e-workflow
npm run verify:clean
```
