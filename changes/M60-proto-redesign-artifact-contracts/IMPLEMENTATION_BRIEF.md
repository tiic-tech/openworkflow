# M60 Implementation Brief

## Goal

Define the artifact contracts needed for image-first `/ow:proto` and
prototype-tuning behavior.

## Read First

- `changes/M59-proto-redesign-planning-dogfood/CANDIDATE_CHANGES.yaml`
- `changes/M60-proto-redesign-artifact-contracts/SELECTED_CHANGE.yaml`
- `/Users/archy/Downloads/vision_to_strategic_prototype_prompt_skill.zip`
- `/Users/archy/Downloads/prototype_tune_to_refined_prompt_skill.zip`
- `references/planning-artifact-contracts.md`

## Do

- Define first-pass strategic prototype prompt pack artifacts.
- Define tune/refined prompt pack artifacts.
- Define how proto behaves with VISION-only input and with validation artifacts.
- Define review evidence and decision handoff rules.
- Add a schema for proto prompt pack artifacts if useful for validation.

## Do Not

- Do not implement `skills/build-prototype` behavior.
- Do not implement tune behavior.
- Do not remove or internalize `ow:validation`.
- Do not add `/ow:proto2html`.
- Do not edit generated `.agents` or `.openworkflow` surfaces.
- Do not touch runtime command registries.

## Owned Paths

- `references/proto-redesign-artifact-contracts.md`
- `schemas/proto-prompt-pack.schema.json`
- `changes/M60-proto-redesign-artifact-contracts/`

## Validation

```bash
npm run validate
```

## Stop Conditions

- Stop if source skill behavior changes are needed.
- Stop if runtime command exposure is needed.
- Stop if validation command removal or automatic validation triggers are needed.
