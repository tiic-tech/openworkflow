# M30 Acceptance

- `openworkflow summaries --root <folder>` reports artifact summary health without writing files.
- `openworkflow summaries --root <folder> --json` emits the shared M28 JSON envelope.
- Summary health is based on existing artifact `summary_policy` metadata.
- Missing stage directories are reported as no instantiated artifacts, not errors.
- `brief/status` exposes summary health at a low-context level.
- `check` includes summary guidance when a command depends on summary-policy artifacts.
- `openworkflow --help` and AGENTS.md managed block mention `summaries`.
- No command in M30 creates stage directories or missing artifacts.

Validation target:

```bash
npm run validate
npm run verify:runtime-surface
npm run verify:e2e-workflow
npm run verify:clean
```
