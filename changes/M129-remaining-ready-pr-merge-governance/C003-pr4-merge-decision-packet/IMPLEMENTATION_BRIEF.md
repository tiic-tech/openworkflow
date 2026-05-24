# M129 C003 Implementation Brief

## Goal

Prepare the high-risk merge decision packet for PR #4 only. This authorizes no merge execution.

## Read First

- `changes/M129-remaining-ready-pr-merge-governance/CANDIDATE_CHANGES.yaml`
- `changes/M129-remaining-ready-pr-merge-governance/C002-decide-next-remaining-pr-merge-target/NEXT_MERGE_TARGET_DECISION.md`
- `changes/M129-remaining-ready-pr-merge-governance/HIGH_RISK_DECISION_REPORT.md`

## Do

- Refresh PR #4 metadata immediately before packet creation.
- Verify PR #4 remote head and current `origin/main`.
- Record exact C004 merge command and exact required approval text.
- Keep C004 gated until the user provides the exact approval text.

## Do Not

- Do not run `gh pr merge`.
- Do not push, force-push, rebase, reset, checkout, delete branches, or perform branch surgery.
- Do not edit PRs, close PRs, request reviews, comment on PRs, or mutate Issues.
- Do not change product source files or generated OpenWorkflow surfaces.

## Owned Paths

- `changes/M129-remaining-ready-pr-merge-governance/`

## Validation

- `gh pr view 4 --repo tiic-tech/openworkflow --json number,url,state,isDraft,title,headRefName,baseRefName,headRefOid,baseRefOid,mergeable,reviewDecision,statusCheckRollup`
- `git ls-remote origin refs/heads/main refs/heads/codex/m102-selected-change-commit-gate`
- `git merge-tree --write-tree origin/main bd2780b1d5b117b2734e5b732164e5d299bd521a`
- `node dist/cli/src/index.js validate --root . --json`
- `node dist/cli/src/index.js summaries --root . --strict --json`
- `git diff --check`

## Stop Conditions

- PR #4 is no longer open, non-draft, or mergeable.
- PR #4 head changes from `bd2780b1d5b117b2734e5b732164e5d299bd521a`.
- Remote main changes before C004 without refreshed evidence.
- The user asks to merge without exact C004 approval text.
