# M42 Acceptance

- Every JSON report includes `health_errors` as an array.
- `summaries --json` with missing/stale summary health emits `ok:false`, exits nonzero, and has non-empty `health_errors`.
- `brief/status/inspect --json` with failing summary or readiness health has non-empty `health_errors`.
- `check/context --json` with readiness blockers has non-empty `health_errors`.
- Healthy reports keep `health_errors: []`.
- Help and AGENTS.md explain `health_errors` versus `warnings`.

Validation target:

```bash
npm run build
npm run validate
npm run verify:runtime-surface
npm run verify:e2e-workflow
```
