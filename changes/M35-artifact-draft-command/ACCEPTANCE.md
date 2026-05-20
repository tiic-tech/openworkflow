# M35 Acceptance

- `openworkflow draft --root <folder> --artifact validation_target --id val-1 --json` previews a contract-shaped YAML artifact without writing.
- `openworkflow draft --root <folder> --artifact validation_target --id val-1 --write --json` writes only `.openworkflow/validation/val-1/VALIDATION.yaml`.
- Duplicate writes fail unless `--force` is provided.
- The command does not update CURRENT_STATE.yaml, indexes, notes, summaries, review files, or evidence directories.
- Invalid artifact types, invalid ids, and non-OpenWorkflow roots return explicit JSON errors.
- Help and AGENTS.md managed block document draft and its dry-run/write boundary.

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
openworkflow draft --root <tmp> --artifact validation_target --id val-1 --json
openworkflow draft --root <tmp> --artifact validation_target --id val-1 --write --json
openworkflow validate --root <tmp> --json
openworkflow draft --root <tmp> --artifact validation_target --id val-1 --write --json
openworkflow draft --root <tmp> --artifact validation_target --id val-1 --write --force --json
```
