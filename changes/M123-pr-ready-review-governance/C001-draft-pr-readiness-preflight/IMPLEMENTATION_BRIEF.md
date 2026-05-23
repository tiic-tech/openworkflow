# C001 - Draft PR Readiness Preflight

## Goal

Refresh current read-only readiness facts for draft PR #5 and PR #4 before any
ready-for-review approval packet or PR state mutation is considered.

## Read First

- `changes/M123-pr-ready-review-governance/CANDIDATE_CHANGES.yaml`
- `changes/M123-pr-ready-review-governance/HIGH_RISK_DECISION_REPORT.md`
- `references/git-version-control-governance.md`
- `references/gh-operation-governance.md`

## Do

- Query PR #5 and PR #4 with `gh pr view`.
- Compare remote branch heads with PR head OIDs.
- Record a durable preflight packet under the C001 folder.
- Recommend the next ready-for-review decision target.

## Do Not

- Do not run `gh pr ready`.
- Do not merge, close, edit, or retarget any PR.
- Do not push, force-push, delete branches, rebase, reset, or mutate Issues.
- Do not change product source.

## Owned Paths

- `changes/M123-pr-ready-review-governance/`

## Validation

- `git status --short --branch`
- `gh pr view 5 --repo tiic-tech/openworkflow --json number,url,state,isDraft,title,headRefName,baseRefName,headRefOid,baseRefOid,mergeable,reviewDecision,statusCheckRollup`
- `gh pr view 4 --repo tiic-tech/openworkflow --json number,url,state,isDraft,title,headRefName,baseRefName,headRefOid,baseRefOid,mergeable,reviewDecision,statusCheckRollup`
- `git ls-remote --heads origin codex/m117-git-automation-remote-readiness codex/m102-selected-change-commit-gate`
- `git diff --check`

## Stop Conditions

- Stop if either PR is no longer open or draft.
- Stop if a remote branch head differs from the PR head OID.
- Stop if any action would mutate PR, Issue, branch, or source state.
