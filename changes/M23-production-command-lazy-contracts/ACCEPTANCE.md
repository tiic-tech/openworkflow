# M23 Acceptance

- `openworkflow init` keeps the repository-local `.openworkflow` setup minimal: config, workflow index, and audit files only.
- `ARTIFACT_CONTRACTS.yaml` carries enough lazy-create metadata for downstream agents to create stage artifacts on first command invocation.
- `/ow:spec`, `/ow:change`, and `/ow:team` are no longer placeholder skills; each gives a first consumer agent concrete context loading, output boundaries, quality bars, and handoff gates.
- Generated production-stage skills explicitly warn against precreating specs, changes, or runtime artifacts during init or sync.
- Runtime and E2E verification cover both the richer command intelligence and the minimal init boundary.

Validation target:

```bash
npm run validate
npm run verify:runtime-surface
npm run verify:e2e-workflow
npm run verify:clean
npm run smoke:init
npm run validate:cli
```
