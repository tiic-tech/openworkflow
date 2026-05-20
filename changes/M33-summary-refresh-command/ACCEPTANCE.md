# M33 Acceptance

- `openworkflow summarize --root <folder> --artifact <path> --json` previews a SUMMARY.yaml refresh without writing.
- `openworkflow summarize --root <folder> --artifact <path> --write --json` writes the corresponding SUMMARY.yaml.
- `openworkflow summarize --root <folder> --all --write --json` refreshes missing or stale `summary_file` artifacts.
- The command does not modify source-of-truth artifacts, indexes, CURRENT_STATE.yaml, or raw evidence.
- current_slice artifacts are reported as skipped with guidance.
- After a write, `openworkflow summaries --root <folder> --json` reports the affected artifact as current.
- Non-OpenWorkflow roots return an explicit not-initialized error.
- Help and AGENTS.md managed block document summarize and `--write`.

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
openworkflow summaries --root <tmp> --json
openworkflow summarize --root <tmp> --artifact .openworkflow/prototypes/proto-1/EVIDENCE.yaml --json
openworkflow summarize --root <tmp> --artifact .openworkflow/prototypes/proto-1/EVIDENCE.yaml --write --json
openworkflow summaries --root <tmp> --json
openworkflow clean --root <tmp> --tools codex --yes --json
```
