# M04 Acceptance

M04 is complete when OpenWorkflow has a working npm-first TypeScript CLI
foundation.

Required evidence:

- `npm run build` succeeds.
- `node dist/cli/src/index.js init /tmp/openworkflow-m04-smoke --tools codex --force`
  creates both `.openworkflow/` and `.codex/`.
- `node dist/cli/src/index.js validate --root /tmp/openworkflow-m04-smoke` passes.
- `python3 scripts/validate_openworkflow.py --root .` passes for the repository.
