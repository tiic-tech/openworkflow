# Goal

Create a read-only inventory of historical branch ownership and PR-ready evidence for M120.

# Do

- Record the current branch and dirty-tree state.
- List local `codex/m*` branches.
- List remote `codex/*` branches.
- List current GitHub PRs for `tiic-tech/openworkflow`.
- Map `PR_READY_SUMMARY.md` files to plan ids and recorded branch boundaries.
- Check whether each PR-ready summary exists on its recorded owning branch.
- Identify shared branch boundaries, missing branch-local evidence, and publication blockers.

# Do Not

- Do not push, create PRs, edit PRs, close PRs, mark PRs ready, merge, or mutate Issues.
- Do not create, delete, reset, rebase, cherry-pick, force-push, or move branch pointers.
- Do not repair branches in C001.
- Do not edit product source, generated adapter surfaces, or `.openworkflow/**`.

# Evidence

- `changes/M120-historical-branch-repair/C001-inventory-historical-branch-ownership/INVENTORY.md`

# Validation

- `git status --short --branch`
- `git branch --list 'codex/m*' --format='%(refname:short)'`
- `git ls-remote --heads origin 'codex/*'`
- `gh pr list --repo tiic-tech/openworkflow --state all --json number,url,state,isDraft,title,headRefName,baseRefName --limit 50`
- `find changes -maxdepth 2 -name PR_READY_SUMMARY.md`
- `git diff --check`
