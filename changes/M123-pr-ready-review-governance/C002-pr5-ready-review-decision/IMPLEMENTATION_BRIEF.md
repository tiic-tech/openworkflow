# C002 - PR #5 Ready-For-Review Decision

## Goal

Prepare the exact approval packet for marking PR #5 ready for review, without
executing the ready-for-review transition.

## Read First

- `changes/M123-pr-ready-review-governance/C001-draft-pr-readiness-preflight/READINESS_PREFLIGHT.md`
- `changes/M123-pr-ready-review-governance/HIGH_RISK_DECISION_REPORT.md`
- `references/gh-operation-governance.md`

## Do

- Name the exact PR #5 ready-for-review command.
- Record current PR #5 state, refs, mergeability, and status checks.
- State that the packet is evidence, not approval.
- Block C003 until the exact command is approved by the user.

## Do Not

- Do not run `gh pr ready`.
- Do not change PR #4.
- Do not merge, close, edit, retarget, or comment on any PR.
- Do not push, force-push, rebase, reset, delete branches, or mutate Issues.

## Owned Paths

- `changes/M123-pr-ready-review-governance/`
- `changes/M123-pr-ready-review-governance/HIGH_RISK_DECISION_REPORT.md`

## Validation

- `node dist/cli/src/index.js validate --root . --json`
- `git diff --check`

## Stop Conditions

- Stop before C003 unless the user approves exactly:
  `gh pr ready 5 --repo tiic-tech/openworkflow`.
- Stop if PR #5 is no longer open or draft.
- Stop if PR #5 head/base refs differ from the recorded facts.
