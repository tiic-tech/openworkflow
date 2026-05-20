# M31 Acceptance

- `brief/status --json` cannot report `data.health.ok: true` when summary health is false.
- `summaries --root <non-openworkflow> --json` returns an explicit not-initialized signal.
- Initialized projects with no stage artifacts still report `not_instantiated` summary entries without creating stage directories.
- `check <command> --json` promotes relevant summary health issues into warnings and keeps structured `summary_guidance`.
- `doctor` and `validate` clearly state or expose their boundary relative to summary health.
- SUMMARY.yaml validation policy is explicit and covered by regression tests.
- `openworkflow --help` and AGENTS.md managed block remain synchronized.
- M31 does not generate, refresh, or rewrite SUMMARY.yaml.

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
openworkflow brief --root <tmp> --json
openworkflow summaries --root <tmp> --json
openworkflow check /ow:proto --root <tmp> --json
openworkflow sync --root <tmp> --tools auto --json
openworkflow doctor --root <tmp> --tools auto --json
openworkflow validate --root <tmp> --json
openworkflow clean --root <tmp> --tools codex --yes --json
```
