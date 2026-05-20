# M37 Acceptance

- `openworkflow clean --root <folder> --tools codex --yes` removes managed `.openworkflow` metadata files without deleting source artifact directories.
- `VALIDATION.yaml`, `PROTOTYPE.yaml` or `EVIDENCE.yaml`, `SUMMARY.yaml`, and user notes under `.openworkflow` survive clean.
- Text and JSON clean output report preserved `.openworkflow` paths.
- Generated Codex adapter files and the AGENTS.md managed block are still cleaned.
- `openworkflow --help` and AGENTS.md managed block document the non-destructive clean boundary.

Validation target:

```bash
npm run build
npm run validate
npm run verify:clean
npm run verify:runtime-surface
```
