# M41 Acceptance

- `openworkflow context --root <folder> --json` returns `command_audit` for the selected command.
- Compact mode omits `.openworkflow/audit/COMMAND_AUDIT_INDEX.yaml` with a structured-representation reason.
- `openworkflow context --root <folder> --mode full --json` includes `COMMAND_AUDIT_INDEX.yaml` when budget allows.
- Help and AGENTS.md describe compact command audit slices.

Validation target:

```bash
npm run build
npm run validate
npm run verify:runtime-surface
npm run verify:e2e-workflow
```
