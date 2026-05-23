# C002 - M71 Push Decision And Isolated Preflight

## Goal

Prepare local-only evidence for a later approved M71 branch push without
executing the push.

## Read First

- `changes/M122-m71-historical-stack-publication/HIGH_RISK_DECISION_REPORT.md`
- `changes/M122-m71-historical-stack-publication/C001-refresh-m71-publication-preflight/PUBLICATION_PREFLIGHT.md`
- `changes/M71-git-version-control-governance/PR_READY_SUMMARY.md`
- `references/git-version-control-governance.md`
- `references/gh-operation-governance.md`

## Do

- Select C002 under the user-approved narrow preflight option.
- Use an isolated worktree for `codex/m71-git-version-governance`.
- Record local head, remote branch state, PR state, remote-plan result, simulator result, and conflict probe.
- Keep the later exact push command explicit and unapproved.

## Do Not

- Do not run `git push`.
- Do not create a draft PR.
- Do not mark any PR ready for review.
- Do not merge, edit, close, retarget, or comment on any PR.
- Do not mutate Issues, force-push, rebase, reset, cherry-pick, split branches, or delete branches.

## Owned Paths

- `changes/M122-m71-historical-stack-publication/`
- `changes/M122-m71-historical-stack-publication/HIGH_RISK_DECISION_REPORT.md`

## Validation

- `node dist/cli/src/index.js validate --root . --json`
- `git diff --check`

## Stop Conditions

- Stop before any remote mutation.
- Stop if local M71 head differs from `a0ddcf94b0f856a92218ef07fd323d3eb5bae0a1`.
- Stop if remote branch or PR state changes before the approved push step.
- Stop unless the user separately approves the exact C003 push command.
