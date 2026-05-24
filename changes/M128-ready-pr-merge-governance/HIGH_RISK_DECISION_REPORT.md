# M128 C003 High-Risk Decision Report: PR #6 Merge

Prepared at: 2026-05-24T16:57:13+08:00

This report is evidence, not approval. It does not authorize or execute a merge.

## Approved C003 Scope

User-approved local-only C003 action:

```text
Approve M128 C003 decision packet: prepare PR #6 merge high-risk decision packet; do not run gh pr merge, push, edit PRs, mutate Issues, or perform branch surgery.
```

Performed in C003:

- Refreshed PR #6 read-only metadata.
- Verified remote head branch still matches the PR head OID.
- Verified the base is an ancestor of the head.
- Verified a read-only merge-tree probe returns a clean tree.
- Prepared the exact later C004 approval gate.

Not performed:

- `gh pr merge`
- push or force-push
- PR edit, close, retarget, comment, or review request
- Issue mutation
- branch checkout, deletion, rebase, reset, split/surgery, or other destructive git operation
- product source change

## Target

- PR: #6
- URL: https://github.com/tiic-tech/openworkflow/pull/6
- Title: `M71: Git version control governance`
- Base: `main`
- Base OID: `d0e13f4bba3a847b763d2db3f771659aac3a4fe5`
- Head branch: `codex/m71-git-version-governance`
- Head OID: `a0ddcf94b0f856a92218ef07fd323d3eb5bae0a1`
- Merge method proposed for C004: merge commit via `--merge`

## Current Evidence

Read-only PR #6 metadata:

- State: `OPEN`
- Draft: `false`
- Merged at: `null`
- Mergeability: `MERGEABLE`
- Review decision: empty
- Status check rollup: empty
- Head OID unchanged from C002: yes
- Base OID unchanged from C002: yes

Remote branch:

- `refs/heads/codex/m71-git-version-governance`
- Remote OID: `a0ddcf94b0f856a92218ef07fd323d3eb5bae0a1`
- Matches PR head OID: yes

Local merge checkpoint:

- `git merge-base --is-ancestor d0e13f4bba3a847b763d2db3f771659aac3a4fe5 a0ddcf94b0f856a92218ef07fd323d3eb5bae0a1` returned success.
- `git merge-tree --write-tree d0e13f4bba3a847b763d2db3f771659aac3a4fe5 a0ddcf94b0f856a92218ef07fd323d3eb5bae0a1` returned clean tree `bbf7b9e12650cd3d984f7fa379e8ecd3871bf5e3`.

## Recommendation

Recommend preparing C004 to merge PR #6 with a merge commit, guarded by the expected head SHA:

```bash
gh pr merge 6 --repo tiic-tech/openworkflow --merge --match-head-commit a0ddcf94b0f856a92218ef07fd323d3eb5bae0a1
```

Rationale:

- PR #6 is the first target selected by C002.
- PR #6 is the 66-commit common historical stack whose head is an ancestor of PR #4, PR #5, and PR #7.
- `--merge` preserves the historical commit sequence instead of squashing or rebasing it.
- `--match-head-commit` prevents merging if PR #6 changes head before C004 executes.
- The command does not include `--delete-branch`, so it does not request remote branch deletion.

## Required C004 Approval

Exact approval text required before running the merge command:

```text
Approve M128 C004 merge PR #6: run gh pr merge 6 --repo tiic-tech/openworkflow --merge --match-head-commit a0ddcf94b0f856a92218ef07fd323d3eb5bae0a1
```

C004 must verify PR #6 still matches the expected state immediately before running the command.

## Stop Criteria

Stop before C004 if any of these are true:

- PR #6 is not `OPEN`.
- PR #6 is draft.
- PR #6 `headRefOid` is not `a0ddcf94b0f856a92218ef07fd323d3eb5bae0a1`.
- PR #6 `baseRefOid` is not `d0e13f4bba3a847b763d2db3f771659aac3a4fe5`.
- PR #6 `mergeable` is not `MERGEABLE`.
- A status check or review policy appears that should block merge.
- The user approval text differs from the exact C004 approval text above.

## Rollback Limits

After a GitHub merge mutates `main`, rollback is not automatic and must not be attempted by C004. If the merge needs to be undone, create a separate high-risk revert governance queue with read-only evidence, exact revert command, validation expectations, and explicit user approval.

## Follow-Up Boundary

After any approved PR #6 merge, PR #4, PR #5, and PR #7 must be refreshed against the new `main` before any later merge packet. M128 should not merge additional PRs without a refreshed queue maintenance decision or follow-up queue.
