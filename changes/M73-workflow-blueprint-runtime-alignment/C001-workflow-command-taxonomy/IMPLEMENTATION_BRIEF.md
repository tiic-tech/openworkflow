# C001 Implementation Brief

## Goal

Create the workflow blueprint runtime alignment reference before implementing
any new runtime surfaces.

## Read First

- `docs/OW_DEVELOP_PLAN.md`
- `docs/OW_DEVELOP_PLAN_Phase2.md`
- `changes/M54-decompose-select-change-planning/C013-runtime-exposure-reassessment/WORKFLOW_BLUEPRINT_REASSESSMENT.md`
- `changes/M73-workflow-blueprint-runtime-alignment/C001-workflow-command-taxonomy/SELECTED_CHANGE.yaml`

## Do

- Add `references/workflow-blueprint-runtime-alignment.md`.
- Define the main workflow:
  `vision -> validation -> proto -> tune -> proto2html -> html2spec -> build -> change -> archive`.
- Define advanced/supporting surfaces: `review`, `build-agent`, and
  `build-skill`.
- Place DTC, AC, and SC inside the `/ow:change` loop.
- Record proto2html, html2spec, build, review, archive, build-agent,
  build-skill, lifecycle transactions, and expanded read models as deferred
  feature refs that need later DTC queues.

## Do Not

- Do not add runtime command registry entries.
- Do not edit generated `.agents/**`, `.openworkflow/**`, or `AGENTS.md`.
- Do not implement proto2html, html2spec, build, review, archive, build-agent,
  or build-skill runtime behavior.

## Validation

```bash
npm run validate
git diff --check
```
