# S002 - Generated Codex Skill Metadata

## Goal

Add structured generated metadata to Codex runtime skill frontmatter so generated
skills can identify their source command, adapter, template, and trigger.

## Read First

- `references/skill-system-lifecycle.md`
- `packages/adapters/codex/src/constants.ts`
- `packages/adapters/codex/src/generateSkills.ts`
- `packages/adapters/codex/src/generatedFiles.ts`
- `packages/adapters/codex/src/manifest.ts`
- `packages/adapters/codex/src/templates.ts`
- `packages/cli/src/dev/verifyRuntimeSurface.ts`

## Do

- Add a `metadata` block to generated `SKILL.md` frontmatter.
- Keep existing `name`, `description`, and generated marker behavior.
- Verify metadata in `verifyRuntimeSurface`.
- Run sync to refresh `.agents/skills/**` from source.

## Do Not

- Do not change command semantics.
- Do not edit `.agents/skills/**` manually.
- Do not add non-Codex adapters.
- Do not expose `/ow:proto2html`.

## Owned Paths

- `packages/adapters/codex/src/generateSkills.ts`
- `packages/adapters/codex/src/generatedFiles.ts`
- `packages/adapters/codex/src/manifest.ts`
- `packages/adapters/codex/src/templates.ts`
- `packages/adapters/codex/src/constants.ts`
- `packages/cli/src/dev/verifyRuntimeSurface.ts`
- `.agents/skills/`
- `changes/M69-skill-system-lifecycle-planning/S002-generated-skill-metadata/`

## Validation

- `npm run validate`
- `npm run verify:runtime-surface`
- `git diff --check`

## Stop Conditions

- Stop if metadata requires changing core command semantics.
- Stop if sync would overwrite non-generated user content.
