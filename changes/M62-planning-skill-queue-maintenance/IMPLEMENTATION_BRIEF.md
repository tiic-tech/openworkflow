# M62 Implementation Brief

## Goal

Harden the planning skills so existing `CANDIDATE_CHANGES.yaml` queues can be
maintained by stable candidate id with durable audit history.

## Read First

- `skills/decompose-to-changes/SKILL.md`
- `skills/select-change/SKILL.md`
- `schemas/candidate-changes.schema.json`
- `references/planning-artifact-contracts.md`

## Do

- Add queue maintenance mode to `decompose-to-changes`.
- Add targeted readiness review to `select-change`.
- Define top-level `operations` for candidate queue audit.
- Update M54 with C006 and operation evidence.

## Do Not

- Do not add runtime command exposure.
- Do not implement CLI operations.
- Do not edit generated `.agents` or `.openworkflow` surfaces.
- Do not change proto redesign source behavior.

## Owned Paths

- `skills/decompose-to-changes/`
- `skills/select-change/`
- `schemas/candidate-changes.schema.json`
- `references/planning-artifact-contracts.md`
- `changes/M54-decompose-select-change-planning/CANDIDATE_CHANGES.yaml`
- `changes/M62-planning-skill-queue-maintenance/`

## Validation

```bash
npm run validate
```

## Stop Conditions

- Stop if runtime command registry changes are needed.
- Stop if generated adapter surfaces need edits.
- Stop if queue operations require a CLI implementation.
