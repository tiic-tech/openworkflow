# Goal

Produce a read-only remote publication preflight packet for M119 C001 and choose the first safe pilot branch, or record exact blockers when no branch is ready.

# Read First

- `changes/M119-approved-remote-pr-publication/CANDIDATE_CHANGES.yaml`
- `changes/M119-approved-remote-pr-publication/C001-refresh-remote-publication-preflight/SELECTED_CHANGE.yaml`
- `changes/M118-repo-branch-pr-governance/C004-produce-remote-push-and-pr-execution-plan/REMOTE_PUBLICATION_PLAN.md`
- `references/git-version-control-governance.md`
- `references/gh-operation-governance.md`

# Do

- Inspect local git state, remote URL, and `gh` auth status.
- Run read-only `git-automation remote-plan` probes for the likely pilot queues.
- Write a local preflight packet under the C001 folder.
- Update C001 atom tasks and queue completion evidence if the preflight packet is finished.

# Do Not

- Do not push any branch.
- Do not create, edit, close, mark ready, or merge any PR.
- Do not mutate Issues, labels, milestones, or assignments.
- Do not rebase, reset, force-push, delete branches, or move branch pointers.
- Do not edit source code, generated adapter surfaces, or `.openworkflow/**`.

# Owned Paths

- `changes/M119-approved-remote-pr-publication/`
- `changes/M102-selected-change-commit-gate/PR_READY_SUMMARY.md` only if the preflight proves a local summary correction is required
- `changes/M117-git-automation-remote-readiness/PR_READY_SUMMARY.md` only if the preflight proves a local summary correction is required

# Validation

- `git status --short --branch`
- `git remote -v`
- `gh auth status`
- `node dist/cli/src/index.js git-automation remote-plan --root . --queue <target-queue> --base origin/main --remote origin --target-base main --json`
- `ruby -ryaml -e 'ARGV.each { |f| YAML.load_file(f); puts "ok #{f}" }' ...`
- `node dist/cli/src/index.js validate --root . --json`
- `git diff --check`

# Stop Conditions

- Stop before any remote mutation.
- Stop if the current branch is not `codex/m119-approved-remote-pr-publication`.
- Stop if remote-plan requires simulator evidence that is unavailable.
- Stop if the first pilot branch cannot be chosen without branch repair.
- Stop before selecting C002 or C003 unless a high-risk decision report exists and the user approves the exact command.
