# M56 Implementation Brief

## Goal

Implement the repo-local `decompose-to-changes` source skill.

## Read First

- `changes/M54-decompose-select-change-planning/CANDIDATE_CHANGES.yaml`
- `references/planning-artifact-contracts.md`
- `skills/decompose-to-changes/SKILL.md`

## Do

- Keep the skill focused on planning candidate queues.
- Explain how to write `CANDIDATE_CHANGES.yaml`, `CANDIDATE_CHANGES.md`, and
  `SUMMARY.yaml`.
- Preserve stable candidate ids and YAML-as-source-of-truth rules.
- Include dogfood evidence for the current `/ow:proto` redesign discussion.

## Do Not

- Do not implement `select-change`.
- Do not expose new `/ow:*` runtime commands.
- Do not implement `/ow:proto` redesign changes.
- Do not edit generated `.agents` or `.openworkflow` surfaces.

## Owned Paths

- `skills/decompose-to-changes/`
- `changes/M56-decompose-to-changes-skill/`
- `changes/M54-decompose-select-change-planning/CANDIDATE_CHANGES.yaml`

## Validation

```bash
python3 /Users/archy/.codex/skills/.system/skill-creator/scripts/quick_validate.py skills/decompose-to-changes
npm run validate
```

## Stop Conditions

- Stop if command registry or adapter generation changes become necessary.
- Stop if candidate selection artifacts are needed; that belongs to C003.
- Stop if the proto redesign needs production implementation.
