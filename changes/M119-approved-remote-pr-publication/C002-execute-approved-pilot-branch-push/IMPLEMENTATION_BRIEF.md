# Goal

Execute the one explicitly approved M119 C002 pilot branch push and record auditable evidence.

# Approved Command

```bash
git push origin codex/m102-selected-change-commit-gate
```

# Do

- Confirm the approved branch is `codex/m102-selected-change-commit-gate`.
- Confirm the working tree is clean before the push.
- Verify `origin/main` is readable and the target remote branch state is known.
- Run the M102 simulator and remote-plan preflight before push.
- Push exactly the approved branch to `origin`.
- Record the pushed remote ref, local commit hash, approval source, and rollback notes.

# Do Not

- Do not create, edit, close, mark ready, or merge a PR.
- Do not push any other branch.
- Do not force-push.
- Do not rebase, reset, cherry-pick, delete branches, or move branch pointers.
- Do not mutate Issues, labels, milestones, or assignments.
- Do not edit product source, generated adapter surfaces, or `.openworkflow/**`.

# Evidence

- `changes/M119-approved-remote-pr-publication/HIGH_RISK_DECISION_REPORT.md`
- `changes/M119-approved-remote-pr-publication/C002-execute-approved-pilot-branch-push/REMOTE_PUSH_AUDIT.md`

# Next Gate

C003 draft PR creation remains a separate high-risk remote mutation. It requires a new explicit
approval for the concrete `gh pr create --draft` command.
