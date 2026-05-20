# M32 Acceptance

- `openworkflow inspect --root <folder> --json` emits the shared report envelope.
- Inspect is the recommended Agent entry command in `openworkflow --help` and AGENTS.md managed block.
- Inspect includes project, workflow, health, summaries, next-command readiness, read order, and recommended next actions.
- Inspect reports non-OpenWorkflow roots explicitly.
- Inspect is read-only and does not create stage directories or missing artifacts.
- Unhealthy summaries make inspect health false consistently.
- Runtime and workflow E2E tests cover inspect behavior.

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
openworkflow inspect --root <tmp> --json
openworkflow summaries --root <tmp> --json
openworkflow check /ow:proto --root <tmp> --json
openworkflow doctor --root <tmp> --tools codex --json
openworkflow validate --root <tmp> --json
openworkflow clean --root <tmp> --tools codex --yes --json
```
