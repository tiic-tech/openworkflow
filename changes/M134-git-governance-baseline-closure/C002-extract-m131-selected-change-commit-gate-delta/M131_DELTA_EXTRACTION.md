# M134 C002 M131 Delta Extraction

## Source Delta

Compared M131 primary source commit `f18620c` against current `origin/main` for:

- `packages/cli/src/commands/gitAutomation.ts`
- `packages/core/src/git/localGitAutomation.ts`
- `packages/cli/src/dev/verifyRuntimeSurface.ts`

## Extracted

- `git-automation commit` now detects `queue_policy.selected_change_commit_gate: strict` plus a completed candidate with `implementation_changed_files: true`, then refuses mutation unless `--commit-evidence` is present.
- Selected-change path inference now supports both map-shaped `selection.artifacts.selected_change` and list-shaped `selection.artifacts`.
- `commitSelectedChange` now supports `requireEvidenceBackfill`, preflights queue and selected-change evidence targets, and fails closed when strict backfill cannot be performed.
- Runtime-surface verification now asserts the missing `--commit-evidence` failure before the successful backfill path.

## Not Extracted

- Historical M131 branch artifacts and stacked branch history.
- Remote publication behavior.
- Any generated `.agents/**` or `.openworkflow/**` manual patch.

## Approval

The user explicitly authorized completing all M134 git-governance changes with highest permission. This C002 extraction remains local to the M134 branch and does not perform remote mutation.
