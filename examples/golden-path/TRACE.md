# Golden Path Trace

This example shows the minimum OpenWorkflow contract chain after
`/build-workflow` initializes a repository.

Trace:

1. `/build-workflow` creates `.codex/workflow/`, `.codex/context/`,
   `.codex/vision/`, `.codex/decisions/`, `.codex/spec/`, and
   `.codex/changes/`.
2. `/build-change` writes `.codex/changes/M01/CHANGE.yaml`.
3. `/build-slices` writes `.codex/changes/M01/WORK_ITEMS.yaml`.
4. `/build-team` can consume the change and work item contracts to create
   `.codex/runtime/**`.
5. `/run-team` can execute runtime state while preserving upstream traceability.

This example intentionally stops before runtime initialization.

