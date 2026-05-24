# S001 - Native Skill Lifecycle Contract

## Goal

Write the source reference that defines OpenWorkflow's native skill format and
lifecycle before more generated runtime surfaces are changed.

## Read First

- `changes/M69-skill-system-lifecycle-planning/CANDIDATE_CHANGES.yaml`
- `packages/adapters/codex/src/generateSkills.ts`
- `packages/adapters/codex/src/generateCommands.ts`
- `.agents/skills/ow-proto/SKILL.md`

## Do

- Create `references/skill-system-lifecycle.md`.
- Define OW skills as YAML frontmatter plus Markdown plus XML-like protocol
  blocks, not full XML documents.
- Document source registries, generated surfaces, sync ownership, and drift
  expectations.
- State what OW borrows from OpenSpec and what it rejects.
- Add a short pointer from `references/planning-artifact-contracts.md`.

## Do Not

- Do not edit `.agents/**` or `.openworkflow/**`.
- Do not change command registry, artifact registry, or adapter generation code.
- Do not expose `/ow:proto2html`.
- Do not implement multi-adapter support.

## Owned Paths

- `references/skill-system-lifecycle.md`
- `references/planning-artifact-contracts.md`
- `changes/M69-skill-system-lifecycle-planning/S001-skill-lifecycle-contract/`

## Validation

- `npm run validate`
- `git diff --check`

## Stop Conditions

- Stop if the contract would require changing generated files to stay coherent.
- Stop if the scope expands into adapter implementation or runtime command exposure.
