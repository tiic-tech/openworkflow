# M20 Acceptance

M20 is accepted when OpenWorkflow has a deterministic workflow-level regression
check for the discovery loop from vision through tune.

## Required Outcomes

- `npm run verify:e2e-workflow` exists.
- The command initializes a temporary OpenWorkflow target through the built CLI.
- The command verifies the generated Codex runtime surface as a connected
  workflow story, not only as isolated skill text checks.
- Vision checks cover conversation-first behavior, sustained grill, mandatory
  coverage, and readiness gating before validation.
- Validation and prototype checks cover handoff into prototype without exposing
  manual decision as the next user step.
- Prototype checks cover visual-first static concept behavior, reference
  extraction, design seed selection, and verification/self-critique gates.
- Tune checks cover default prototype targeting, proto orchestration, and
  internal decision audit.
- Display label checks preserve `ow:*` presentation and `/ow:*` semantic
  command references.

## Validation

- `npm run build` passes.
- `npm run validate` passes.
- `npm run verify:runtime-surface` passes.
- `npm run verify:e2e-workflow` passes.
- `npm run smoke:init` passes.
- `node dist/cli/src/index.js sync --root /tmp/openworkflow-m04-smoke --tools codex` passes.
- `node dist/cli/src/index.js doctor --root /tmp/openworkflow-m04-smoke --tools codex` passes.
- `npm run validate:cli` passes.
