# G004 - Git Governance Validation

## Goal

Add repository validation for branch-governed candidate queues and completion
evidence shape.

## Read First

- `packages/core/src/validators/validateRepositoryContracts.ts`
- `packages/cli/src/dev/verifyRuntimeSurface.ts`
- `changes/M71-git-version-control-governance/CANDIDATE_CHANGES.yaml`

## Do

- Validate `queue_policy.branch_boundary` when present.
- Validate done candidate completion evidence is present and string-shaped.
- Validate commit evidence format when a completion evidence item starts with
  `commit:`.
- Add a runtime-surface negative case for malformed branch boundary metadata.

## Do Not

- Do not require branch metadata for all historical queues.
- Do not execute git commands from the validator.
- Do not implement PR or gh automation.

## Owned Paths

- `packages/core/src/validators/validateRepositoryContracts.ts`
- `packages/cli/src/dev/verifyRuntimeSurface.ts`
- `changes/M71-git-version-control-governance/G004-git-governance-validation/`

## Validation

- `npm run validate`
- `git diff --check`
- `npm run verify:runtime-surface`

## Stop Conditions

- Stop if validation would require rewriting historical queues.
- Stop if commit hash validation would require self-referential commits.
