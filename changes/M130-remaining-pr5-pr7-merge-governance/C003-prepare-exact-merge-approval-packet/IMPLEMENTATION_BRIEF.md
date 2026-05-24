# M130 C003 Implementation Brief

## Goal

Prepare the high-risk merge decision packet for PR #7 only. This authorizes no merge execution.

## Read First

- `changes/M130-remaining-pr5-pr7-merge-governance/CANDIDATE_CHANGES.yaml`
- `changes/M130-remaining-pr5-pr7-merge-governance/C002-decide-next-pr5-pr7-merge-target/NEXT_MERGE_TARGET_DECISION.md`
- `changes/M130-remaining-pr5-pr7-merge-governance/HIGH_RISK_DECISION_REPORT.md`

## Do

- Refresh PR #7 metadata immediately before packet creation.
- Verify PR #7 remote head and current `origin/main`.
- Record exact C004 merge command and exact required approval text.
- Keep C004 gated until the user provides the exact approval text.

## Do Not

- Do not run `gh pr merge`.
- Do not push, force-push, rebase, reset, checkout, delete branches, or perform branch surgery.
- Do not edit PRs, close PRs, request reviews, comment on PRs, or mutate Issues.
- Do not change product source files or generated OpenWorkflow surfaces.

## Owned Paths

- `changes/M130-remaining-pr5-pr7-merge-governance/`

## Validation

- `gh pr view 7 --repo tiic-tech/openworkflow --json number,url,state,isDraft,title,headRefName,baseRefName,headRefOid,baseRefOid,mergeable,reviewDecision,statusCheckRollup`
- `git ls-remote origin refs/heads/main refs/heads/codex/m101-build-proto-prompt-command-split`
- `git merge-tree --write-tree origin/main f8bf087211316506f48155859f3e18edbc7224e4`
- `node dist/cli/src/index.js validate --root . --json`
- `node dist/cli/src/index.js summaries --root . --strict --json`
- `git diff --check`

## Stop Conditions

- PR #7 is no longer open, non-draft, or mergeable.
- PR #7 head changes from `f8bf087211316506f48155859f3e18edbc7224e4`.
- Remote main changes before C004 without refreshed evidence.
- The user asks to merge without exact C004 approval text.
