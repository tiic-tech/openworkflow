# Workflow Layout Reference

Use this reference when initializing or reconciling OpenWorkflow contract
infrastructure.

## Required Layout

```txt
.codex/
  workflow/
    WORKFLOW_INDEX.yaml
    CONTRACT_GRAPH.yaml
    archive/
  context/
    CONTEXT.md
    CONTEXT_MAP.yaml
    GLOSSARY.yaml
    archive/
  vision/
    VISION.md
    VISION_CONTRACT.yaml
    archive/
  decisions/
    DECISION_INDEX.yaml
    archive/
  spec/
    SPEC_INDEX.yaml
    archive/
  validation/
    VALIDATION_INDEX.yaml
    archive/
  prototypes/
    PROTOTYPE_INDEX.yaml
    archive/
  changes/
    archive/
```

## Ownership

- `/ow:workflow` owns the folders and indexes above.
- `/ow:context` should update `.openworkflow/context/**`.
- `/ow:vision` should update `.openworkflow/vision/**`.
- `/ow:decision` should add decision records and update
  `.openworkflow/decisions/DECISION_INDEX.yaml`.
- `/ow:spec` should add specs and update `.openworkflow/specs/SPEC_INDEX.yaml`.
- `/ow:validation` should add validation-first prioritization artifacts and
  update `.openworkflow/validation/VALIDATION_INDEX.yaml`.
- `/ow:prototype` should add prototype discovery artifacts and update
  `.openworkflow/prototypes/PROTOTYPE_INDEX.yaml`.
- `/ow:change` should write under `.openworkflow/changes/<id>/`.
- `/ow:team` owns `.openworkflow/runtime/**`.

## Initialization Rule

Create missing files and directories. Do not overwrite existing contract files
unless the user explicitly requests regeneration.
