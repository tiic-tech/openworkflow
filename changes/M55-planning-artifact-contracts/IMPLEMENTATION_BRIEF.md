# M55 Implementation Brief

## Goal

Define the planning artifact vocabulary required by `decompose-to-changes` and
`select-change`.

## Read First

- `changes/M54-decompose-select-change-planning/CANDIDATE_CHANGES.yaml`
- `references/planning-artifact-contracts.md`
- `schemas/candidate-changes.schema.json`
- `schemas/selected-change.schema.json`
- `schemas/atom-tasks.schema.json`

## Do

- Keep YAML as the source of truth for candidate queues.
- Define selected change and atom task contracts clearly enough for future
  skills to write them.
- Keep Markdown readable views non-authoritative.
- Update M54 candidate status with selection and completion evidence.

## Do Not

- Do not implement either skill.
- Do not expose new `/ow:*` commands.
- Do not hand-edit generated `.agents` or `.openworkflow` surfaces.
- Do not include `/ow:proto` redesign implementation in this change.

## Owned Paths

- `schemas/`
- `references/planning-artifact-contracts.md`
- `changes/M55-planning-artifact-contracts/`
- `changes/M54-decompose-select-change-planning/CANDIDATE_CHANGES.yaml`

## Validation

```bash
npm run validate
```

## Stop Conditions

- Stop if implementation requires command registry changes.
- Stop if skill behavior needs to be written.
- Stop if planning artifacts need generated adapter support.
