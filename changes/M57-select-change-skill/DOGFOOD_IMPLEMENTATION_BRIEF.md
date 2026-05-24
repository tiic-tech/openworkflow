# Dogfood Implementation Brief: Proto Redesign Artifact Contract

## Goal

Define the artifact contract for image-first `ow:proto` redesign before source
skill or runtime changes begin.

## Read First

- `changes/M56-decompose-to-changes-skill/DOGFOOD_PROTO_REDESIGN_CANDIDATE_CHANGES.yaml`
- `references/planning-artifact-contracts.md`
- `skills/build-prototype/SKILL.md`
- `skills/build-validation/SKILL.md`

## Do

- Define how proto consumes VISION and optional validation evidence.
- Define image prompt, critique, tuning, and review evidence fields.
- Keep HTML conversion as an explicit non-goal.
- Leave source skill and runtime behavior for later candidates.

## Do Not

- Do not implement `ow:proto`.
- Do not expose runtime command changes.
- Do not edit generated `.agents` or `.openworkflow` surfaces.
- Do not decide validation visibility beyond the contract hooks needed by proto.

## Owned Paths

- `references/`
- `schemas/`
- `changes/proto-redesign-artifact-contract/`

## Validation

```bash
npm run validate
```

## Stop Conditions

- Stop if source proto skill behavior needs to change.
- Stop if validation command removal or automation becomes necessary.
- Stop if runtime registry or adapter generation changes are required.
