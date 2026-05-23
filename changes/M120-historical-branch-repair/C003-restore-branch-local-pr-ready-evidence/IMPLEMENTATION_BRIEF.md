# Goal

Restore branch-local PR-ready evidence for the low-risk M117 target and record the repair in M120.

# Do

- Confirm `codex/m117-git-automation-remote-readiness` exists locally.
- Confirm `changes/M117-git-automation-remote-readiness/PR_READY_SUMMARY.md` is absent on M117 before repair.
- Switch to the M117 branch only after M120 selection evidence is committed.
- Run `git-automation summary --write` for the M117 queue.
- Commit the M117 `PR_READY_SUMMARY.md` locally.
- Rerun M117 `remote-plan` read-only and record remaining blockers.
- Return to M120 and record the repair audit.

# Do Not

- Do not push any branch.
- Do not create, edit, close, mark ready, or merge any PR.
- Do not mutate Issues, labels, milestones, or assignments.
- Do not rebase, reset, cherry-pick, force-push, delete branches, or move branch pointers.
- Do not repair shared M101-derived branches in C003.
- Do not edit product source, generated adapter surfaces, or `.openworkflow/**`.

# Evidence

- M117 local summary commit evidence.
- `changes/M120-historical-branch-repair/C003-restore-branch-local-pr-ready-evidence/M117_EVIDENCE_REPAIR.md`
