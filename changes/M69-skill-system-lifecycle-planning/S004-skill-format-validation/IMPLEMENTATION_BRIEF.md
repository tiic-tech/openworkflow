# S004 - Generated Skill Format Validation

## Goal

Make generated Codex skills part of repository contract validation, not only
runtime smoke verification.

## Read First

- `references/skill-system-lifecycle.md`
- `packages/core/src/validators/validateRepositoryContracts.ts`
- `packages/cli/src/dev/verifyRuntimeSurface.ts`
- `.agents/openworkflow-adapter.yaml`
- `.agents/skills/ow-proto/SKILL.md`

## Do

- Validate generated `SKILL.md` frontmatter when `.agents/openworkflow-adapter.yaml` exists.
- Validate generated metadata fields against the adapter manifest command entries.
- Validate required XML-like protocol blocks and reject a top-level `<skill>` wrapper.
- Add negative runtime verification by tampering a generated skill and expecting `openworkflow validate` to fail.

## Do Not

- Do not change command semantics.
- Do not alter generated skill content unless validation exposes a source defect.
- Do not add new adapters.
- Do not validate root `skills/**` source skills in this change.

## Validation

- `npm run validate`
- `npm run verify:runtime-surface`
- `git diff --check`
