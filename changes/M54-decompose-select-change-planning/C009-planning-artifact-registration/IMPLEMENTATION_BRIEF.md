# C009 Implementation Brief

## Goal

Define the summary-first planning artifact registration contract that future
runtime exposure work can consume without loading full planning history by
default.

## Read First

- `references/planning-skill-runtime-exposure.md`
- `references/planning-artifact-contracts.md`
- `changes/M54-decompose-select-change-planning/C009-planning-artifact-registration/SELECTED_CHANGE.yaml`

## Do

- Document planning artifact roles and registration expectations.
- Define minimum summary/read-model fields for candidate queues, analyses,
  selected changes, atom tasks, and local evidence.
- Keep runtime command registry and adapter generation out of scope.
- Update M54 queue artifacts with C009 completion and follow-up candidates.

## Do Not

- Do not edit runtime command registry code.
- Do not edit artifact registry code.
- Do not edit adapter generation.
- Do not edit generated `.agents/**` or `.openworkflow/**` files.

## Owned Paths

- `references/planning-artifact-contracts.md`
- `references/planning-skill-runtime-exposure.md`
- `changes/M54-decompose-select-change-planning/C009-planning-artifact-registration/`
- M54 queue, readable view, and summary.

## Validation

```bash
npm run validate
git diff --check
```

## Stop Conditions

- Stop if implementation requires runtime registry, artifact registry, adapter
  generation, or generated-surface edits.
- Stop if the next recommended candidate is high risk without explicit
  approval.
