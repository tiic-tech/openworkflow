# M14 Acceptance

M14 is accepted when OpenWorkflow's active repository validation and runtime
surface verification path runs through TypeScript/Node, matching the npm-first
architecture without translating stale skill prototype assumptions.

## Required Checks

- `npm run build`
- `npm run validate`
- `npm run verify:runtime-surface`
- `npm run smoke:init`
- `node dist/cli/src/index.js sync --root /tmp/openworkflow-m04-smoke --tools codex`
- `node dist/cli/src/index.js doctor --root /tmp/openworkflow-m04-smoke --tools codex`
- `npm run validate:cli`

## Product Checks

- Active npm scripts do not call `python3`.
- Root-level Python scripts are removed from the active project path.
- Repository validation remains contract-aware, not just YAML parse validation.
- Runtime surface verification still checks `.agents/skills/ow-*`.
- Legacy skill helper Python scripts are explicitly left as a future redesign/migration queue.
