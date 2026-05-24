# M129 C002 Implementation Brief

## Goal

Choose exactly one next merge target among PR #4, PR #5, and PR #7 using C001 evidence and current read-only refresh data. Do not approve or execute a merge.

## Read First

- `changes/M129-remaining-ready-pr-merge-governance/CANDIDATE_CHANGES.yaml`
- `changes/M129-remaining-ready-pr-merge-governance/C001-refresh-remaining-pr-merge-readiness/MERGE_READINESS_REFRESH.md`
- `changes/M129-remaining-ready-pr-merge-governance/C002-decide-next-remaining-pr-merge-target/NEXT_MERGE_TARGET_DECISION.md`

## Do

- Compare PR #4, PR #5, and PR #7 by refreshed readiness, ancestry, branch dependency, and blast radius.
- Recommend one target or stop with blockers.
- Record C003 approval text for preparing a high-risk merge decision packet.
- Keep deferred PRs open and untouched.

## Do Not

- Do not run `gh pr merge`.
- Do not edit PRs, close PRs, request reviews, comment on PRs, or mutate Issues.
- Do not push, force-push, rebase, reset, checkout, delete branches, or perform branch surgery.
- Do not change product source files or generated OpenWorkflow surfaces.

## Owned Paths

- `changes/M129-remaining-ready-pr-merge-governance/`

## Validation

- `node dist/cli/src/index.js validate --root . --json`
- `node dist/cli/src/index.js summaries --root . --strict --json`
- `git diff --check`

## Stop Conditions

- Any target PR is no longer open, non-draft, or mergeable.
- Any remote PR head differs from the PR API head OID.
- All candidate PRs produce merge-tree conflicts.
- The next step requests merge execution without a C003 high-risk decision packet and exact C004 approval.
