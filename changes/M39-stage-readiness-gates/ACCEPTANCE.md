# M39 Acceptance

- `openworkflow check /ow:proto --json` blocks when `CURRENT_STATE.current_validation` points to a draft or empty validation artifact.
- A validation artifact with a non-empty core question, prototype scope, and acceptance passes the `/ow:proto` semantic gate.
- `/ow:spec`, `/ow:change`, and `/ow:team` block on missing or false readiness booleans in current design/spec/change artifacts.
- Readiness blockers include specific artifact paths and fields to repair.
- Help and AGENTS.md explain that `check` validates semantic readiness, not just file existence.

Validation target:

```bash
npm run build
npm run validate
npm run verify:runtime-surface
```
