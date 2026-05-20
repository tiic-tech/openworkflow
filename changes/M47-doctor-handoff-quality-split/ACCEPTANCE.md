# M47 Acceptance

- `doctor --json` includes `managed_surface_ok`, `adapter_ok`, `summary_freshness_ok`, and `handoff_quality_ok`.
- Thin summary quality keeps `doctor.ok:true` when managed surfaces are healthy.
- Thin summary quality sets `handoff_quality_ok:false` and points `next_actions` to `summaries --strict`.
- Help and AGENTS.md clarify that doctor ok does not prove handoff quality.
- Runtime verification covers doctor handoff-quality split.

Validation target:

```bash
npm run build
npm run verify:runtime-surface
npm run validate
```
