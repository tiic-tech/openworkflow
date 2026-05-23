# Goal

Define M120's historical branch repair policy and stop boundaries from the C001 inventory.

# Do

- Classify the observed branch/evidence situations by risk.
- State when stacked branches may remain intentionally coupled.
- State when branch-local PR-ready summary restoration is sufficient.
- State when creating a new branch, cherry-picking, rebasing, resetting, deleting, or force-pushing
  requires a high-risk decision report and exact approval.
- Keep remote publication out of scope.

# Do Not

- Do not push, create PRs, edit PRs, close PRs, mark PRs ready, merge, or mutate Issues.
- Do not create, delete, reset, rebase, cherry-pick, force-push, or move branch pointers.
- Do not repair branches in C002.
- Do not edit product source, generated adapter surfaces, or `.openworkflow/**`.

# Evidence

- `changes/M120-historical-branch-repair/C002-branch-repair-policy/BRANCH_REPAIR_POLICY.md`

# Validation

- `node dist/cli/src/index.js validate --root . --json`
- `git diff --check`
