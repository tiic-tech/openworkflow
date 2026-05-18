# Golden Path Trace

This example shows the minimum OpenWorkflow contract chain after
`/build-workflow` initializes a repository.

Trace:

1. `/build-workflow` creates `.codex/workflow/`, `.codex/context/`,
   `.codex/vision/`, `.codex/decisions/`, `.codex/spec/`, and
   `.codex/changes/`.
2. `/build-validation` writes a critical assumption contract and prototype
   brief under `.codex/validation/V001-travel-globe-core/`.
3. `/build-prototype` writes `.codex/prototypes/P001-travel-globe-core/`
   without creating production specs, changes, teams, or runtime state.
4. `/build-decision` records whether user review supports continuing.
5. `/build-change` writes `.codex/changes/M01/CHANGE.yaml` only after the
   prototype decision authorizes production slicing.
6. `/build-slices` writes `.codex/changes/M01/WORK_ITEMS.yaml`.
7. `/build-team` can consume the decision, change, and work item contracts to create
   `.codex/runtime/**`.
8. `/run-team` can execute runtime state while preserving upstream traceability.

This example intentionally stops before runtime initialization.
