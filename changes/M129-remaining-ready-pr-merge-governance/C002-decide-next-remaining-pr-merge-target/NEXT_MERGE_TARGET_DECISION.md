# M129 C002 Next Merge Target Decision

Captured: 2026-05-25T00:11:11+08:00

Decision: recommend PR #4, `OpenWorkflow M102-selected-change-commit-gate`, as the next merge-governance target.

This decision does not approve merge execution. It only unlocks C003 to prepare a high-risk decision packet for PR #4 if the user explicitly approves that packet-preparation step.

## Current Read-Only Facts

- `origin/main`: `8656ed135c7a57c5b515572fa06bc082aabdcb95`
- PR #4 head: `bd2780b1d5b117b2734e5b732164e5d299bd521a`
- PR #5 head: `898f0152a4e3e026ee5dcc78d4ef585c722a37b7`
- PR #7 head: `f8bf087211316506f48155859f3e18edbc7224e4`
- PR #4, PR #5, and PR #7 remain open, non-draft, and API-mergeable.
- PR #4, PR #5, and PR #7 report no status checks through `statusCheckRollup`.
- GitHub PR API still reports old base OID `d0e13f4bba3a847b763d2db3f771659aac3a4fe5` for all three PRs.
- All remote PR head refs match the PR API head OIDs.
- `git merge-tree --write-tree origin/main <head-oid>` exits `0` for all three PRs.

## Candidate Comparison

| PR | Relationship | Ahead | Behind | Merge-Tree | Dependency / Blast Radius |
| --- | --- | --- | --- | --- | --- |
| #4 | independent from #5/#7 in observed ancestry matrix | 137 | 1 | clean | smallest ahead count; no observed dependency on #5 or #7 |
| #5 | contains PR #7 history because PR #7 is ancestor of PR #5 | 197 | 1 | clean | largest branch; should not be merged before resolving #7 unless deliberately choosing folded shared-stack integration |
| #7 | ancestor of PR #5 | 185 | 1 | clean | shared M101-derived stack; should precede #5 if taking the shared-stack path |

Observed ancestry:

- PR #7 is an ancestor of PR #5.
- PR #4 is not an ancestor of PR #5 or PR #7.
- PR #5 is not an ancestor of PR #4 or PR #7.
- PR #7 is not an ancestor of PR #4.

## Recommendation

Recommend PR #4 as the next target.

Rationale:

- PR #4 is the smallest candidate by ahead count among the three.
- PR #4 has no observed ancestry dependency with PR #5 or PR #7.
- PR #4 has the same basic readiness signals as the others: open, non-draft, API-mergeable, no reported checks, matching remote head, and clean merge-tree.
- PR #5 should wait because it contains PR #7 history and would effectively combine the shared-stack PR #7 with M117 readiness work.
- PR #7 remains viable but carries the shared M101-derived stack risk recorded by M129; it should be handled before PR #5 if that stack path is selected later.

## Deferred PRs

- PR #5 remains open and untouched. It should not be the next target unless a future decision explicitly chooses the folded PR #7 plus PR #5 integration path.
- PR #7 remains open and untouched. It is the natural predecessor to PR #5 if the shared-stack line is handled next after PR #4.

## C003 Approval Text

Required exact approval to prepare the next high-risk decision packet:

`Approve M129 C003 decision packet: prepare PR #4 merge high-risk decision packet; do not run gh pr merge, push, edit PRs, mutate Issues, or perform branch surgery.`

This approval would authorize only preparing the C003 decision packet. It would not authorize running `gh pr merge`.

## Stop Gates

- Stop if PR #4 is no longer open, non-draft, API-mergeable, or its head OID changes.
- Stop if `refs/heads/codex/m102-selected-change-commit-gate` no longer equals `bd2780b1d5b117b2734e5b732164e5d299bd521a`.
- Stop if `origin/main` changes before C003 without refreshing the PR #4 packet.
- Stop if status checks appear and fail or require review.
- Stop before any merge execution until C003 exists and the user provides exact C004 merge approval.

## Commands Run

- `gh pr list --repo tiic-tech/openworkflow --state open --json number,url,title,isDraft,headRefName,baseRefName,headRefOid,baseRefOid,mergeable,reviewDecision,statusCheckRollup --limit 20`
- `git ls-remote origin refs/heads/main refs/heads/codex/m102-selected-change-commit-gate refs/heads/codex/m117-git-automation-remote-readiness refs/heads/codex/m101-build-proto-prompt-command-split`
- `git fetch origin main`
- `git rev-parse origin/main`
- `git merge-base --is-ancestor <candidate-a> <candidate-b>`
- `git merge-base origin/main <head-oid>`
- `git merge-base --is-ancestor origin/main <head-oid>`
- `git rev-list --count origin/main..<head-oid>`
- `git rev-list --count <head-oid>..origin/main`
- `git merge-tree --write-tree origin/main <head-oid>`
