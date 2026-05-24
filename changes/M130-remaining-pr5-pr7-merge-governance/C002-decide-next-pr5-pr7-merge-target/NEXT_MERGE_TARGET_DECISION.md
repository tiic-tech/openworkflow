# M130 C002 Next Merge Target Decision

Captured: 2026-05-25T00:48:22+08:00

Decision: recommend PR #7, `M101 shared stack: M105/M106/M115 governance
updates`, as the next merge-governance target.

This decision does not approve merge execution. It only unlocks C003 to prepare
a high-risk decision packet for PR #7 if the user explicitly approves that
packet-preparation step.

## Current Read-Only Facts

- `origin/main`: `b77418e2fe9b1f6eda213e52f495364bb1861e94`
- PR #5 head: `898f0152a4e3e026ee5dcc78d4ef585c722a37b7`
- PR #7 head: `f8bf087211316506f48155859f3e18edbc7224e4`
- PR #5 and PR #7 remain open, non-draft, and API-mergeable.
- PR #5 and PR #7 report no status checks through `statusCheckRollup`.
- GitHub PR API still reports old base OID `d0e13f4bba3a847b763d2db3f771659aac3a4fe5` for both PRs.
- Both remote PR head refs match the PR API head OIDs.
- `git merge-tree --write-tree origin/main <head-oid>` exits `0` for both PRs.

## Candidate Comparison

| PR | Relationship | Ahead | Behind | Merge-tree | Dependency / Blast Radius |
| --- | --- | ---: | ---: | --- | --- |
| #7 | ancestor of PR #5 | 49 | 3 | clean | shared M101 stack; preserves staged order before PR #5 |
| #5 | contains PR #7 history | 61 | 3 | clean | folds PR #7 plus 12 additional M117 readiness commits into one integration |

Observed ancestry:

- PR #7 is an ancestor of PR #5.
- PR #5 is not an ancestor of PR #7.
- PR #5 is 12 commits ahead of PR #7 and 0 behind PR #7.
- Both PR heads are behind current `origin/main` by 3 commits.

## Recommendation

Recommend PR #7 as the next target.

Rationale:

- PR #7 is the dependency predecessor in the observed branch stack.
- Merging PR #7 first preserves a staged review and merge sequence for the
  shared M101 stack before the M117 readiness work in PR #5.
- PR #5 contains PR #7 history; merging PR #5 first would effectively combine
  PR #7 and the additional PR #5 work into one folded integration.
- PR #7 has the smaller ahead count and the same basic readiness signals as PR
  #5: open, non-draft, API-mergeable, no reported checks, matching remote head,
  and clean merge-tree.
- The M130 source notes PR #7's shared-stack/split-surgery risk. Selecting PR
  #7 next surfaces that risk explicitly in C003 instead of burying it inside PR
  #5.

## Deferred PR

PR #5 remains open and untouched. It should not be merged before PR #7 unless a
future decision explicitly chooses a folded PR #7 plus PR #5 integration path.

## C003 Approval Text

Required exact approval to prepare the next high-risk decision packet:

`Approve M130 C003 decision packet: prepare PR #7 merge high-risk decision packet; do not run gh pr merge, push, edit PRs, mutate Issues, or perform branch surgery.`

This approval would authorize only preparing the C003 decision packet. It would
not authorize running `gh pr merge`.

## Stop Gates

- Stop if PR #7 is no longer open, non-draft, API-mergeable, or its head OID changes.
- Stop if `refs/heads/codex/m101-build-proto-prompt-command-split` no longer equals `f8bf087211316506f48155859f3e18edbc7224e4`.
- Stop if `origin/main` changes before C003 without refreshing the PR #7 packet.
- Stop if status checks appear and fail or require review.
- Stop if review rejects the shared-stack path and requires split/surgery; that is a separate high-risk branch-history operation.
- Stop before any merge execution until C003 exists and the user provides exact C004 merge approval.

## Commands Run

- `node dist/cli/src/index.js resume --root . --json`
- `git status --short --branch`
- `node dist/cli/src/index.js validate --root . --json`
- `node dist/cli/src/index.js summaries --root . --strict --json`
- `git diff --check`
