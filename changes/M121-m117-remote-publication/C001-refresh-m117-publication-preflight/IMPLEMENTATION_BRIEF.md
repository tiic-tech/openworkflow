# M121 C001 Implementation Brief

## Goal

Refresh M117 publication facts from the M121 governance branch and choose the
execution model for any later approved push.

## Read First

- `changes/M121-m117-remote-publication/CANDIDATE_CHANGES.yaml`
- `changes/M120-historical-branch-repair/C005-repaired-publication-order/PUBLICATION_ORDER.md`
- `changes/M117-git-automation-remote-readiness/PR_READY_SUMMARY.md`
- `references/git-version-control-governance.md`
- `references/gh-operation-governance.md`

## Do

- Record current local, remote, PR, and merge-readiness facts for M117.
- Classify current branch mismatch as an execution-model issue, not as approval.
- Choose the safest future execution model for C002/C003.
- Keep all evidence local under `changes/M121-m117-remote-publication/`.

## Do Not

- Do not push.
- Do not create, edit, mark ready, or merge a PR.
- Do not mutate Issues.
- Do not rebase, reset, force-push, delete branches, or rewrite history.
- Do not edit product source or generated surfaces.

## Owned Paths

- `changes/M121-m117-remote-publication/`

## Validation

- `node dist/cli/src/index.js validate --root . --json`
- `node dist/cli/src/index.js summaries --root . --json`
- `git diff --check`

## Stop Conditions

- Stop before C002 unless the high-risk push decision report boundary is
  explicitly accepted.
- Stop before any remote mutation unless the user approves the exact command.
