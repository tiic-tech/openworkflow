# Golden Path Trace

This example shows the minimum OpenWorkflow contract chain after
`/build-workflow` initializes a repository.

Trace:

1. `/build-workflow` creates `.codex/workflow/`, `.codex/context/`,
   `.codex/vision/`, `.codex/decisions/`, `.codex/spec/`, and
   `.codex/changes/`.
2. `/build-validation` writes a critical assumption contract and prototype
   brief under `.codex/validation/V001-travel-globe-core/`.
3. `/build-change` writes `.codex/changes/M01/CHANGE.yaml` after the
   validation target is clear.
4. `/build-slices` writes `.codex/changes/M01/WORK_ITEMS.yaml`.
5. `/build-team` can consume the validation, change, and work item contracts to create
   `.codex/runtime/**`.
6. `/run-team` can execute runtime state while preserving upstream traceability.

This example intentionally stops before runtime initialization.
