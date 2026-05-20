# M36 Acceptance

- `openworkflow register --root <folder> --artifact <path> --json` previews index registration without writing.
- `openworkflow register --root <folder> --artifact <path> --write --json` creates or updates only the configured index file.
- `--current --write` updates the index pointer and matching `CURRENT_STATE.yaml` current pointer.
- `--next-command <ow-command>` updates `CURRENT_STATE.next_command` only together with `--current`.
- Duplicate registration updates the existing index entry rather than appending duplicates.
- Invalid artifact paths, mismatched `artifact_type`, and non-OpenWorkflow roots return explicit JSON errors.
- Help and AGENTS.md managed block document register and its dry-run/write/current boundary.

Validation target:

```bash
npm run build
npm run validate
npm run verify:runtime-surface
npm run verify:e2e-workflow
npm run verify:clean
```

Manual consumer E2E should cover:

```bash
openworkflow init <tmp> --tools codex --force --json
openworkflow draft --root <tmp> --artifact validation_target --id val-1 --write --json
openworkflow register --root <tmp> --artifact .openworkflow/validation/val-1/VALIDATION.yaml --json
openworkflow register --root <tmp> --artifact .openworkflow/validation/val-1/VALIDATION.yaml --write --json
openworkflow register --root <tmp> --artifact .openworkflow/validation/val-1/VALIDATION.yaml --current --next-command /ow:proto --write --json
openworkflow validate --root <tmp> --json
```
