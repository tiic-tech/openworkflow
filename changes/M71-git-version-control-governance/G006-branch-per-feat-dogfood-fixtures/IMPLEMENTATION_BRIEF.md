# G006 - Branch-Per-Feat Dogfood Fixtures

## Goal

Add fixture evidence and runtime checks for the branch-per-feat workflow.

## Read First

- `packages/cli/src/dev/verifyRuntimeSurface.ts`
- `references/git-version-control-governance.md`
- `references/planning-artifact-contracts.md`

## Do

- Add branch-per-feat and PR-ready summary fixture documents.
- Add runtime verification that reads the fixtures and M71 queue metadata.
- Keep fixtures planning-only.

## Do Not

- Do not change git history beyond the final commit for this selected change.
- Do not open a PR.
- Do not call `gh`.

## Owned Paths

- `packages/cli/src/dev/verifyRuntimeSurface.ts`
- `changes/M71-git-version-control-governance/G006-branch-per-feat-dogfood-fixtures/`

## Validation

- `npm run validate`
- `git diff --check`
- `npm run verify:runtime-surface`

## Stop Conditions

- Stop if fixture verification would require remote GitHub access.
- Stop if validation would need broad generated-surface regeneration.
