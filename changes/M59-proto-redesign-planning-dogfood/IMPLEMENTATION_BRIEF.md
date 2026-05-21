# M59 Implementation Brief

## Goal

Use `decompose-to-changes` and `select-change` to prepare the `/ow:proto`
redesign implementation roadmap.

## Read First

- `skills/decompose-to-changes/SKILL.md`
- `skills/select-change/SKILL.md`
- `/Users/archy/Downloads/vision_to_strategic_prototype_prompt_skill.zip`
- `/Users/archy/Downloads/prototype_tune_to_refined_prompt_skill.zip`

## Do

- Create a formal proto redesign candidate queue.
- Select the first proto redesign implementation change.
- Create selected-change, atom-task, and implementation-brief artifacts for the
  selected first implementation change.
- Update M54 C005 with completion evidence.

## Do Not

- Do not implement the selected proto redesign change.
- Do not add `/ow:proto2html`.
- Do not remove or internalize validation command behavior.
- Do not edit generated `.agents` or `.openworkflow` surfaces.

## Owned Paths

- `changes/M59-proto-redesign-planning-dogfood/`
- `changes/M60-proto-redesign-artifact-contracts/`
- `changes/M54-decompose-select-change-planning/CANDIDATE_CHANGES.yaml`

## Validation

```bash
npm run validate
node dist/cli/src/index.js handoff --root . --json
```

## Stop Conditions

- Stop if implementation files outside planning artifacts are needed.
- Stop if runtime registry or adapter generation changes are required.
- Stop if validation removal is required instead of a planning note.
