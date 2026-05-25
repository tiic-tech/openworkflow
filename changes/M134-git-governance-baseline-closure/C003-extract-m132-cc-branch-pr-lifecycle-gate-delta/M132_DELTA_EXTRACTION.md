# M134 C003 M132 Delta Extraction

## Source Delta

Compared M132 branch head `5c256ab` against current `origin/main`, then extracted only the branch/PR lifecycle behavior onto the current M134 branch.

## Extracted

- `packages/core/src/validators/validateRepositoryContracts.ts` now validates `queue_policy.git_lifecycle_gate: strict`.
- `packages/core/src/workflow/summaryHealth.ts` now reports strict lifecycle branch and completed-queue PR evidence blockers in summary trust gates.
- `packages/core/src/commands/registry.ts` now instructs decompose-to-changes to create new queues with `git_lifecycle_gate: strict` and a plan-owned `branch_boundary`.
- `packages/cli/src/dev/verifyRuntimeSurface.ts` now covers missing branch, wrong branch identity, missing completed-queue PR evidence, strict summaries failure, and valid PR evidence.
- `references/git-version-control-governance.md` now documents strict lifecycle mode.

## Generated Surface Handling

The decompose-to-changes source protocol changed in `packages/core/src/commands/registry.ts`; generated `.agents/**` and `.openworkflow/**` surfaces must be refreshed through `node dist/cli/src/index.js sync --root . --tools codex --json`, not manually patched.

## Not Extracted

- Historical M118-M132 planning artifacts from the old stacked branch.
- Large audit documents unrelated to runtime lifecycle enforcement.
- Any remote PR mutation.
