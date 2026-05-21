# C012 Implementation Brief

## Goal

Define the workflow stage graph after C011 command family taxonomy.

## Read First

- `references/workflow-blueprint-runtime-alignment.md`
- `docs/OW_DEVELOP_PLAN.md`
- `changes/M54-decompose-select-change-planning/C013-runtime-exposure-reassessment/WORKFLOW_BLUEPRINT_REASSESSMENT.md`
- `changes/M73-workflow-blueprint-runtime-alignment/C012-workflow-stage-graph/SELECTED_CHANGE.yaml`

## Do

- Add the main workflow stage graph to `references/workflow-blueprint-runtime-alignment.md`.
- Represent `tune` as optional and repeatable.
- Attach `review`, `build-agent`, and `build-skill` as support surfaces.
- Keep `proto2html`, `html2spec`, `build`, `change`, `review`, and `archive`
  as future stage surfaces, not implemented runtime commands.

## Do Not

- Do not define detailed artifact contracts for each future stage.
- Do not implement lifecycle transactions.
- Do not edit runtime command registry, generated `.agents/**`, or `.openworkflow/**`.

## Validation

```bash
npm run validate
git diff --check
```
