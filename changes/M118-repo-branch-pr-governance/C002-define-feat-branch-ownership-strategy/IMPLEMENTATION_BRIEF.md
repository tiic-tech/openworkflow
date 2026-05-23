# M118 C002 Implementation Brief

Define a non-destructive branch ownership strategy for the existing local stack.

## Boundary

This candidate writes strategy artifacts only under `changes/M118-repo-branch-pr-governance/`. It must not create branches, switch branches, move branch pointers, cherry-pick, rebase, reset, force-push, push, create PRs, edit PRs, merge, or mutate Issues.

## Strategy Basis

C001 found 262 commits on `main..HEAD`, 28 parseable candidate queues, sparse remote refs, and several local PR summaries. Branch heads are mostly cumulative: many local feat branches are ancestors of the current M118 HEAD, so a safe plan must treat them as a stacked train unless later approved branch repair splits them.

## Deliverable

Write `BRANCH_OWNERSHIP_STRATEGY.md` with existing branch train, clean local PR candidates, stacked-continuation groups, repair-required queues, forbidden operations, and handoff rules for C003/C004.
