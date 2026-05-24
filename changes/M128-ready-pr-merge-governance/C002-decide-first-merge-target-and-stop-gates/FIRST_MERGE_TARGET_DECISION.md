# M128 C002 First Merge Target Decision

Captured at: 2026-05-24T12:35:33+08:00

Scope: local-only merge target sequencing for M128. This decision packet does not approve or execute a merge.

No merge, push, PR edit, Issue mutation, branch switch, branch deletion, rebase, reset, force-push, split/surgery, or product source change was performed.

## Recommendation

Recommend PR #6 as the first merge target for the later high-risk merge packet.

Target:

- PR: #6
- URL: https://github.com/tiic-tech/openworkflow/pull/6
- Title: `M71: Git version control governance`
- Head branch: `codex/m71-git-version-governance`
- Head OID: `a0ddcf94b0f856a92218ef07fd323d3eb5bae0a1`
- Base branch: `main`
- Base OID: `d0e13f4bba3a847b763d2db3f771659aac3a4fe5`

## Rationale

PR #6 is the smallest common historical stack among the current ready PR set. Its head is an ancestor of PR #4, PR #5, and PR #7, and it is only 66 commits ahead of `origin/main`. Merging it first preserves the review boundary for the foundational git-governance work instead of allowing a larger later PR to implicitly introduce the same commits.

The older PR creation order would suggest PR #4 first, and M120's repaired publication order suggested PR #5 before M71/shared-stack publication. Current ancestry evidence changes the merge-order decision: PR #6 is now the lowest-blast-radius first merge because the other ready heads include it.

## Current PR State

All target PRs remain open, non-draft, mergeable, and based on `main` at `d0e13f4bba3a847b763d2db3f771659aac3a4fe5`.

| PR | Head | Ahead of `origin/main` | Relationship To PR #6 | First-Merge Decision |
| --- | --- | --- | --- | --- |
| #4 | `bd2780b1d5b117b2734e5b732164e5d299bd521a` | 203 | contains PR #6 | defer until after PR #6 refresh |
| #5 | `898f0152a4e3e026ee5dcc78d4ef585c722a37b7` | 263 | contains PR #6 | defer until after PR #6 refresh |
| #6 | `a0ddcf94b0f856a92218ef07fd323d3eb5bae0a1` | 66 | first common stack | recommend first |
| #7 | `f8bf087211316506f48155859f3e18edbc7224e4` | 251 | contains PR #6 | defer until after PR #6 refresh |

Review decision and status-check rollups are empty for all four PRs in the queried metadata. C003 must refresh PR #6 immediately before preparing any merge packet.

## Branch Ancestry Evidence

Commands:

- `git merge-base --is-ancestor a0ddcf94b0f856a92218ef07fd323d3eb5bae0a1 bd2780b1d5b117b2734e5b732164e5d299bd521a` returned success.
- `git merge-base --is-ancestor a0ddcf94b0f856a92218ef07fd323d3eb5bae0a1 898f0152a4e3e026ee5dcc78d4ef585c722a37b7` returned success.
- `git merge-base --is-ancestor a0ddcf94b0f856a92218ef07fd323d3eb5bae0a1 f8bf087211316506f48155859f3e18edbc7224e4` returned success.
- `git merge-base a0ddcf94b0f856a92218ef07fd323d3eb5bae0a1 bd2780b1d5b117b2734e5b732164e5d299bd521a` returned `a0ddcf94b0f856a92218ef07fd323d3eb5bae0a1`.
- `git merge-base a0ddcf94b0f856a92218ef07fd323d3eb5bae0a1 898f0152a4e3e026ee5dcc78d4ef585c722a37b7` returned `a0ddcf94b0f856a92218ef07fd323d3eb5bae0a1`.

## Deferred Alternatives

PR #4 is deferred because it is larger than PR #6 and contains the PR #6 history. After PR #6 merges, PR #4 must be refreshed against the new base before any merge packet.

PR #5 is deferred despite M120's repaired publication ordering because it also contains PR #6 and has a larger blast radius. It remains a strong next candidate after PR #6 refresh.

PR #7 is deferred because it is the shared M101-derived stack and should remain behind the smaller common ancestor and refreshed follow-up ordering.

## C003 Approval Gate

C003 should prepare a high-risk merge decision packet for PR #6 only. It must not run `gh pr merge`.

Exact approval text required to proceed with C003:

```text
Approve M128 C003 decision packet: prepare PR #6 merge high-risk decision packet; do not run gh pr merge, push, edit PRs, mutate Issues, or perform branch surgery.
```

Later merge execution, if C003 recommends it, will require a separate exact C004 approval text that names the concrete `gh pr merge` command.

## Stop Gates

Stop before C003 if:

- PR #6 is no longer open or becomes draft.
- PR #6 head OID changes from `a0ddcf94b0f856a92218ef07fd323d3eb5bae0a1`.
- PR #6 base OID changes from `d0e13f4bba3a847b763d2db3f771659aac3a4fe5` without a refreshed inventory.
- PR #6 is no longer mergeable.
- Review/check policy changes require additional evidence.
- The user asks to merge without the later exact C004 approval.
