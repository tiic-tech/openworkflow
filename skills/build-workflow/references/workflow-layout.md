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
  changes/
    archive/
```

## Ownership

- `build-workflow` owns the folders and indexes above.
- `build-context` should update `.codex/context/**`.
- `build-vision` should update `.codex/vision/**`.
- `build-decision` should add decision records and update
  `.codex/decisions/DECISION_INDEX.yaml`.
- `build-spec` should add specs and update `.codex/spec/SPEC_INDEX.yaml`.
- `build-validation` should add validation-first prioritization artifacts and
  update `.codex/validation/VALIDATION_INDEX.yaml`.
- `build-change` and `build-slices` should write under `.codex/changes/<id>/`.
- `build-team` and `run-team` own `.codex/runtime/**`.

## Initialization Rule

Create missing files and directories. Do not overwrite existing contract files
unless the user explicitly requests regeneration.
