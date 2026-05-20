# M49 Acceptance

- `handoff --json` returns the standard JSON report envelope.
- `handoff --json` includes `handoff_ok`, `blocking_reasons`, `quality_summary`, `managed_surface_ok`, `adapter_ok`, `summary_freshness_ok`, `summary_quality_ok`, `next_command_ready`, `read_order`, and `next_actions`.
- Fresh init handoff passes with `handoff_ok:true`.
- Current-but-thin summaries make handoff fail with `handoff_ok:false` and strict quality blockers.
- Handoff stays read-only and does not create lazy stage artifacts.
- Help and AGENTS.md present handoff as the recommended trust gate before context loading.
- Runtime verification covers handoff success and failure paths.

Validation target:

```bash
npm run build
npm run verify:runtime-surface
npm run validate
```
