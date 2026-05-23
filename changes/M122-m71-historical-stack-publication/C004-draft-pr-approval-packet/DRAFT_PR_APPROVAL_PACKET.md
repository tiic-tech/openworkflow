# M122 C004 Draft PR Approval Packet

## Scope

This packet prepares the exact C004 draft PR creation command for M71. It is
local evidence only and does not approve or execute GitHub mutation.

## Current State

- Head branch: `codex/m71-git-version-governance`
- Base branch: `main`
- Remote branch head: `a0ddcf94b0f856a92218ef07fd323d3eb5bae0a1`
- Existing PRs for head branch: none
- PR body path:
  `changes/M122-m71-historical-stack-publication/C004-draft-pr-approval-packet/PR_BODY.md`

## Exact Command Requiring Approval

```bash
gh pr create --repo tiic-tech/openworkflow --head codex/m71-git-version-governance --base main --draft --title "M71: Git version control governance" --body-file changes/M122-m71-historical-stack-publication/C004-draft-pr-approval-packet/PR_BODY.md
```

## Required Approval Text

```text
Approve M122 C004 draft PR: run gh pr create --repo tiic-tech/openworkflow --head codex/m71-git-version-governance --base main --draft --title "M71: Git version control governance" --body-file changes/M122-m71-historical-stack-publication/C004-draft-pr-approval-packet/PR_BODY.md
```

## Stop Conditions

- Stop if a PR already exists for `codex/m71-git-version-governance`.
- Stop if remote branch head is not `a0ddcf94b0f856a92218ef07fd323d3eb5bae0a1`.
- Stop if the command would create a non-draft PR.
- Stop before ready-for-review conversion, merge, PR edit after creation, PR close, Issue mutation, push, rebase, reset, force-push, or branch deletion.
