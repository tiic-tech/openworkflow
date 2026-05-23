# Goal

Create one explicitly approved draft PR for the pushed M102 pilot branch and record auditable
evidence.

# Approved Command

```bash
gh pr create --draft --repo tiic-tech/openworkflow --base main --head codex/m102-selected-change-commit-gate --title "OpenWorkflow M102-selected-change-commit-gate" --body-file changes/M102-selected-change-commit-gate/PR_READY_SUMMARY.md
```

# Do

- Confirm the remote branch `codex/m102-selected-change-commit-gate` exists.
- Confirm no matching `head=codex/m102-selected-change-commit-gate` and `base=main` PR exists.
- Use `changes/M102-selected-change-commit-gate/PR_READY_SUMMARY.md` as the body source.
- Create exactly one draft PR.
- Verify the PR is open, draft, based on `main`, and headed by the M102 branch.
- Record the PR URL and rollback guidance.

# Do Not

- Do not mark the PR ready for review.
- Do not edit unrelated PRs.
- Do not merge, close, or reopen PRs.
- Do not mutate Issues, labels, milestones, or assignments.
- Do not push additional branches.
- Do not edit product source, generated adapter surfaces, or `.openworkflow/**`.

# Evidence

- `changes/M119-approved-remote-pr-publication/C003-create-approved-draft-pr/DRAFT_PR_AUDIT.md`

# Next Gate

C004 can summarize the completed publication pilot and recommend the next publication or branch
repair action. Any PR edit, ready-for-review transition, merge, or rollback remains separately
approval-gated.
