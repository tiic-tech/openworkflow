# M48 Acceptance

- `context --json` data includes `handoff_quality_ok` and `quality_summary`.
- `doctor --json` data includes `quality_summary`.
- `quality_summary` includes freshness ok, strict quality ok, status counts, warning counts, health error counts, and next actions.
- Thin current summaries keep context/doctor maintenance exit semantics unchanged while exposing `handoff_quality_ok:false`.
- Help and AGENTS.md tell Agents where to read the compact handoff-quality signal.
- Runtime verification covers the compact quality summary fields.

Validation target:

```bash
npm run build
npm run verify:runtime-surface
npm run validate
```
