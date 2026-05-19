# M20 TODO

M20 adds a deterministic E2E regression harness for the OpenWorkflow discovery
loop behavior introduced across M15 through M19.

## Plan

1. [x] Define workflow-level assertions for `vision -> validation -> prototype -> tune`.
2. [x] Add `npm run verify:e2e-workflow`.
3. [x] Verify vision sustained grill, mandatory coverage, and readiness gating.
4. [x] Verify validation handoff does not expose manual decision.
5. [x] Verify prototype visual-first, reference extraction, and design quality gates.
6. [x] Verify tune defaults to prototype and internally records decision audit.
7. [x] Verify slashless `ow:*` display labels and preserved `/ow:*` semantic commands.
8. [x] Run full validation.

## Completion Checklist

- [x] E2E regression command is deterministic and local.
- [x] Failures identify the workflow phase that regressed.
- [x] M15 through M19 behavior contracts are covered in one workflow story.
- [x] Full validation passes.
