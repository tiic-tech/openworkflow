# S005 - Generated Surface Drift Tests

## Goal

Catch drift between command registry, generated audit indexes, Codex manifest,
and generated skill/interface files before agents rely on stale runtime
instructions.

## Read First

- `packages/core/src/validators/validateRepositoryContracts.ts`
- `packages/cli/src/dev/verifyRuntimeSurface.ts`
- `.openworkflow/audit/COMMAND_AUDIT_INDEX.yaml`
- `.openworkflow/audit/CONTEXT_PACKETS.yaml`
- `.agents/openworkflow-adapter.yaml`

## Do

- Compare registry commands to command audit entries.
- Compare registry commands to context packet entries.
- Compare registry commands to Codex manifest commands.
- Validate Codex manifest `generated_files` covers declared skill and interface files.
- Add negative runtime verification by tampering generated surfaces and expecting the dev validator to fail.

## Do Not

- Do not add or rename workflow commands.
- Do not change generated skill protocol contents.
- Do not introduce new adapter delivery architecture.

## Validation

- `npm run validate`
- `npm run verify:runtime-surface`
- `git diff --check`
