# C013 Implementation Brief

## Goal

Define how DTC, AC, and SC sit inside `/ow:change` as planning intelligence
without implementing `/ow:change` runtime orchestration.

## Read First

- `references/workflow-blueprint-runtime-alignment.md`
- `changes/M73-workflow-blueprint-runtime-alignment/C013-change-planning-intelligence-boundary/SELECTED_CHANGE.yaml`

## Do

- Add a `/ow:change` planning intelligence section to
  `references/workflow-blueprint-runtime-alignment.md`.
- Define DTC, AC, and SC as subordinate planning capabilities inside
  `/ow:change`.
- Define high-risk reports as stop packets, not approval.
- State that full `/ow:change` orchestration remains a deferred feature.

## Do Not

- Do not implement `/ow:change` orchestration.
- Do not change DTC, AC, or SC source skills.
- Do not edit runtime command registry, generated `.agents/**`, or `.openworkflow/**`.

## Validation

```bash
npm run validate
git diff --check
```
