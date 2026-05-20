# M50 Acceptance

- `context --json` keeps existing non-strict behavior.
- `context --handoff --json` includes `handoff_mode:true`.
- `context --handoff --json` fails when `quality_summary` reports `current_but_thin`.
- `context --handoff --json` exposes strict summary quality blockers in `health_errors`.
- Handoff context remains read-only and does not create lazy stage artifacts.
- Help and AGENTS.md explain when to use `context --handoff` versus `handoff`.
- Runtime verification covers default context behavior and handoff context failure.

Validation target:

```bash
npm run build
npm run verify:runtime-surface
npm run validate
```
