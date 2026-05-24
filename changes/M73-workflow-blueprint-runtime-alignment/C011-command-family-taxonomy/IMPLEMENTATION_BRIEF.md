# C011 Implementation Brief

## Goal

Define the OpenWorkflow command family taxonomy before stage graph and runtime
surface work.

## Read First

- `docs/OW_DEVELOP_PLAN.md`
- `docs/OW_DEVELOP_PLAN_Phase2.md`
- `changes/M54-decompose-select-change-planning/C013-runtime-exposure-reassessment/WORKFLOW_BLUEPRINT_REASSESSMENT.md`
- `changes/M73-workflow-blueprint-runtime-alignment/C011-command-family-taxonomy/SELECTED_CHANGE.yaml`

## Do

- Add or update `references/workflow-blueprint-runtime-alignment.md`.
- Define command families:
  - primary workflow commands
  - internal planning and decision commands
  - advanced creation commands
  - asynchronous support commands
- Classify DTC, AC, and SC as planning intelligence inside `/ow:change`.

## Do Not

- Do not define detailed stage graph sequencing; that is C012.
- Do not implement `/ow:change` orchestration; that is a deferred feature.
- Do not edit runtime command registry, generated `.agents/**`, or `.openworkflow/**`.

## Validation

```bash
npm run validate
git diff --check
```
