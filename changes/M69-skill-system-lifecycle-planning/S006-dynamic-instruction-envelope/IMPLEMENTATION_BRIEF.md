# S006 - Dynamic Instruction Envelope Design

## Goal

Document whether OpenWorkflow should use dynamic instruction envelopes in
addition to static runtime skills.

## Read First

- `references/skill-system-lifecycle.md`
- `changes/M69-skill-system-lifecycle-planning/CANDIDATE_CHANGES.yaml`

## Do

- Add `references/artifact-instruction-envelope.md`.
- Explain static skill protocol versus dynamic per-artifact/task instruction envelopes.
- Define when XML-like tags, Markdown, and YAML are appropriate.
- Include leakage prevention rules.
- Link the new reference from `references/skill-system-lifecycle.md`.

## Do Not

- Do not implement a CLI command.
- Do not change generated skills, adapters, schemas, or runtime surfaces.
- Do not edit `.agents/**` or `.openworkflow/**`.

## Validation

- `npm run validate`
- `git diff --check`
