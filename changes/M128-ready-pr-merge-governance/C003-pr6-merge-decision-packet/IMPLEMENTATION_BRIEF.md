# C003 PR #6 Merge Decision Packet

## Goal

Prepare the high-risk merge decision packet for PR #6 without running `gh pr merge`.

## Read First

- `changes/M128-ready-pr-merge-governance/C002-decide-first-merge-target-and-stop-gates/FIRST_MERGE_TARGET_DECISION.md`
- `changes/M128-ready-pr-merge-governance/C001-refresh-ready-pr-merge-readiness-inventory/MERGE_READINESS_INVENTORY.md`
- `references/git-version-control-governance.md`
- `references/gh-operation-governance.md`

## Do

- Verify the user approved only the C003 decision packet.
- Refresh current PR #6 metadata and merge-readiness signals.
- Write `HIGH_RISK_DECISION_REPORT.md`.
- Record exact C004 approval text for the later merge command.

## Do Not

- Do not run `gh pr merge`.
- Do not push, force-push, rebase, reset, delete branches, or switch branches.
- Do not edit, close, retarget, comment on, or request review for PRs.
- Do not mutate Issues or product source.

## Owned Paths

- `changes/M128-ready-pr-merge-governance/`

## Validation

- `gh pr view 6 --repo tiic-tech/openworkflow --json number,url,state,isDraft,title,headRefName,baseRefName,headRefOid,baseRefOid,mergeable,reviewDecision,statusCheckRollup,mergedAt`
- `git ls-remote --heads origin codex/m71-git-version-governance`
- `git merge-tree --write-tree d0e13f4bba3a847b763d2db3f771659aac3a4fe5 a0ddcf94b0f856a92218ef07fd323d3eb5bae0a1`
- `node dist/cli/src/index.js validate --root . --json`
- `git diff --check`

## Stop Conditions

- PR #6 current state changes before C004.
- User asks for merge execution before providing the exact C004 approval text.
- Any operation would mutate GitHub or local git history outside the approved command.
