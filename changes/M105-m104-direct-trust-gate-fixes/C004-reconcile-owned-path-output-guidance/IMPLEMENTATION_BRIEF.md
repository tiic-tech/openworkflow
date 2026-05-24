# M105 C004 Implementation Brief

## Objective

Improve the Agent-facing failure when git-automation refuses a commit because
OW command outputs are dirty but missing from the selected change's `owned_paths`.

The fix should make the diagnostic specific enough that the Agent can update
the selected-change scope or queue before retrying, without weakening the
strict dirty-path refusal.

## Preferred Fix

When unrelated dirty paths include common OW command outputs such as
`.openworkflow/CURRENT_STATE.yaml`, indexes, `SUMMARY.yaml`, or decision files,
add a warning or error detail that says these look like workflow output paths
and should be included in the candidate's owned paths only when expected for
the selected change.

Do not auto-allow them.

## Validation

Run:

- `npm run build`
- `npm run verify:runtime-surface`
- `node dist/cli/src/index.js validate --root . --json`
- `node dist/cli/src/index.js summaries --root . --strict --json`
- `node dist/cli/src/index.js handoff --root . --json`
- `git diff --check`
