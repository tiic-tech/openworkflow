# M134 C002 Implementation Brief

## Goal

Extract the M131 selected-change commit-evidence gate onto the fresh M134 branch without cherry-picking old stacked history.

## Inputs

- M131 primary source commit `f18620c`.
- Current `origin/main` after PR #5 merge.
- M134 C001 inventory.
- `references/git-version-control-governance.md`.

## Output

- Strict `git-automation commit` refusal when a completed implementation candidate in a strict queue omits `--commit-evidence`.
- Required evidence backfill preflight in local git automation.
- Runtime fixture coverage for the missing-evidence failure and successful backfill path.

## Boundaries

C002 changes source and M134 planning evidence only. It does not push, create/edit/close/merge PRs, mutate Issues, delete branches, force-push, rebase, reset, revert, or hand-edit generated `.agents/**` or `.openworkflow/**` surfaces.
