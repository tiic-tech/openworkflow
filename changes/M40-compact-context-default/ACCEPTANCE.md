# M40 Acceptance

- `openworkflow context --root <folder> --json` reports `mode: compact` and uses a compact default budget.
- Compact mode omits `.openworkflow/audit/ARTIFACT_CONTRACTS.yaml` and `.openworkflow/audit/CONTEXT_PACKETS.yaml` content with explicit structured-representation reasons.
- `openworkflow context --root <folder> --mode full --json` may include managed audit source files when budget allows.
- Trusted SUMMARY.yaml/current_slice content remains preferred in compact mode.
- Help and AGENTS.md document `--mode compact|full` and when to use full mode.

Validation target:

```bash
npm run build
npm run validate
npm run verify:runtime-surface
npm run verify:e2e-workflow
```
