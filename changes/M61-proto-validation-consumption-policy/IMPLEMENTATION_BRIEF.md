# M61 Implementation Brief

## Goal

Clarify how image-first `/ow:proto` consumes validation context before source
proto behavior changes.

## Read First

- `changes/M59-proto-redesign-planning-dogfood/CANDIDATE_CHANGES.yaml`
- `references/proto-redesign-artifact-contracts.md`
- `changes/M60-proto-redesign-artifact-contracts/SELECTED_CHANGE.yaml`

## Do

- Define VISION-only proto fallback behavior.
- Define behavior when `VALIDATION.yaml` and `PROTOTYPE_BRIEF.md` exist.
- Record that automatic validation is a future explicit change.
- Update M59 queue status and next recommendation.

## Do Not

- Do not remove `ow:validation`.
- Do not implement automatic validation triggers.
- Do not implement source proto prompt behavior.
- Do not edit generated `.agents` or `.openworkflow` surfaces.
- Do not touch runtime command registries.

## Owned Paths

- `references/proto-redesign-artifact-contracts.md`
- `changes/M61-proto-validation-consumption-policy/`
- `changes/M59-proto-redesign-planning-dogfood/CANDIDATE_CHANGES.yaml`

## Validation

```bash
npm run validate
```

## Stop Conditions

- Stop if source `skills/build-prototype` changes are needed.
- Stop if runtime command exposure is needed.
- Stop if automatic validation implementation is needed.
