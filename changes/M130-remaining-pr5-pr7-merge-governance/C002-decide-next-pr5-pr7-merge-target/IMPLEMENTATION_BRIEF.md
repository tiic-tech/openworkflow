# M130 C002 Implementation Brief

## Goal

Choose exactly one next merge target between PR #5 and PR #7 using C001
evidence. Do not approve or execute a merge.

## Read First

- `changes/M130-remaining-pr5-pr7-merge-governance/CANDIDATE_CHANGES.yaml`
- `changes/M130-remaining-pr5-pr7-merge-governance/C001-refresh-pr5-pr7-merge-readiness/MERGE_READINESS_REFRESH.md`
- `changes/M130-remaining-pr5-pr7-merge-governance/C002-decide-next-pr5-pr7-merge-target/NEXT_MERGE_TARGET_DECISION.md`

## Do

- Compare PR #5 and PR #7 by refreshed readiness, ancestry, branch dependency,
  and blast radius.
- Recommend one target or stop with blockers.
- Record C003 approval text for preparing a high-risk merge decision packet.
- Keep the deferred PR open and untouched.

## Do Not

- Do not run `gh pr merge`.
- Do not edit PRs, close PRs, request reviews, comment on PRs, or mutate
  Issues.
- Do not push, force-push, rebase, reset, delete branches, or perform branch
  surgery.
- Do not change product source files or generated OpenWorkflow surfaces.

## Owned Paths

- `changes/M130-remaining-pr5-pr7-merge-governance/`

## Validation

- `node dist/cli/src/index.js validate --root . --json`
- `node dist/cli/src/index.js summaries --root . --strict --json`
- `git diff --check`

## Stop Conditions

- PR #7 is no longer open, non-draft, or mergeable.
- PR #7 remote head differs from the C001 PR API head OID.
- `origin/main` changes before C003 without refreshing the PR #7 packet.
- The next step requests merge execution without a C003 high-risk decision
  packet and exact C004 approval.
