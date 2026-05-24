# M57 Implementation Brief

## Goal

Implement the repo-local `select-change` source skill.

## Read First

- `changes/M54-decompose-select-change-planning/CANDIDATE_CHANGES.yaml`
- `references/planning-artifact-contracts.md`
- `changes/M56-decompose-to-changes-skill/DOGFOOD_PROTO_REDESIGN_CANDIDATE_CHANGES.yaml`

## Do

- Keep the skill focused on selecting and preparing one change.
- Explain how to emit `SELECTED_CHANGE.yaml`, `ATOM_TASKS.yaml`, and
  `IMPLEMENTATION_BRIEF.md`.
- Preserve stable candidate ids and queue history.
- Include dogfood evidence selecting one proto redesign candidate from the M56
  sample queue.

## Do Not

- Do not execute the selected implementation.
- Do not expose runtime `/ow:*` command surfaces.
- Do not implement the proto redesign.
- Do not edit generated `.agents` or `.openworkflow` surfaces.

## Owned Paths

- `skills/select-change/`
- `changes/M57-select-change-skill/`
- `changes/M54-decompose-select-change-planning/CANDIDATE_CHANGES.yaml`

## Validation

```bash
python3 /Users/archy/.codex/skills/.system/skill-creator/scripts/quick_validate.py skills/select-change
npm run validate
```

## Stop Conditions

- Stop if implementation work begins.
- Stop if runtime registry or adapter generation changes become necessary.
- Stop if queue selection requires changing the candidate decomposition itself.
