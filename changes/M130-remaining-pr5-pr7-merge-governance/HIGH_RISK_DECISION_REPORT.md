# M130 C003 High-Risk Decision Report: PR #7 Merge

Prepared at: 2026-05-25T01:49:56+08:00

This report is evidence, not approval. It does not authorize or execute a merge.

## C003 Scope

User request authorizing local-only C003 work:

```text
推进c003
```

This was treated only as approval to prepare the C003 decision packet. It does not authorize C004 merge execution.

Performed in C003:

- Refreshed PR #7 read-only metadata.
- Verified remote head branch still matches the PR head OID.
- Refreshed local `origin/main` for read-only merge calculations.
- Verified a read-only merge-tree probe against current `origin/main` returns a clean tree.
- Prepared the exact later C004 approval gate.

Not performed:

- `gh pr merge`
- push or force-push
- PR edit, close, retarget, comment, or review request
- Issue mutation
- branch checkout, deletion, rebase, reset, split/surgery, or other destructive git operation
- product source change

## Target

- PR: #7
- URL: https://github.com/tiic-tech/openworkflow/pull/7
- Title: `M101 shared stack: M105/M106/M115 governance updates`
- Base: `main`
- PR API base OID: `d0e13f4bba3a847b763d2db3f771659aac3a4fe5`
- Current remote `main` OID: `b77418e2fe9b1f6eda213e52f495364bb1861e94`
- Head branch: `codex/m101-build-proto-prompt-command-split`
- Head OID: `f8bf087211316506f48155859f3e18edbc7224e4`
- Merge method proposed for C004: merge commit via `--merge`

## Current Evidence

Read-only PR #7 metadata:

- State: `OPEN`
- Draft: `false`
- Mergeability: `MERGEABLE`
- Review decision: empty
- Status check rollup: empty
- Head OID unchanged from C002: yes
- API base OID still reports pre-PR #4 base: yes
- Actual remote `main` matches M130 target base: yes

Remote branches:

- `refs/heads/main`: `b77418e2fe9b1f6eda213e52f495364bb1861e94`
- `refs/heads/codex/m101-build-proto-prompt-command-split`: `f8bf087211316506f48155859f3e18edbc7224e4`
- PR head OID matches remote head branch: yes

Local merge checkpoint:

- `git merge-base origin/main f8bf087211316506f48155859f3e18edbc7224e4` returned `5a4fc221f4243924ba4cc0c3f5158b07ecc8d394`.
- `git rev-list --count origin/main..f8bf087211316506f48155859f3e18edbc7224e4` returned `49`.
- `git rev-list --count f8bf087211316506f48155859f3e18edbc7224e4..origin/main` returned `3`.
- `git merge-tree --write-tree origin/main f8bf087211316506f48155859f3e18edbc7224e4` returned clean tree `b08f45c07bdb3aca44c1e45bea7b37da1ba2cae3`.

## Recommendation

Recommend preparing C004 to merge PR #7 with a merge commit, guarded by the expected head SHA:

```bash
gh pr merge 7 --repo tiic-tech/openworkflow --merge --match-head-commit f8bf087211316506f48155859f3e18edbc7224e4
```

Rationale:

- PR #7 is the target selected by C002.
- PR #7 remains the dependency predecessor for PR #5 in the observed branch stack.
- PR #7 is open, non-draft, API-mergeable, has no reported checks, and its remote head matches the PR API head.
- `--merge` preserves the historical commit sequence instead of squashing or rebasing it.
- `--match-head-commit` prevents merging if PR #7 changes head before C004 executes.
- The command does not include `--delete-branch`, so it does not request remote branch deletion.

## Required C004 Approval

Exact approval text required before running the merge command:

```text
Approve M130 C004 merge PR #7: run gh pr merge 7 --repo tiic-tech/openworkflow --merge --match-head-commit f8bf087211316506f48155859f3e18edbc7224e4
```

C004 must verify PR #7 still matches the expected state immediately before running the command.

## Stop Criteria

Stop before C004 if any of these are true:

- PR #7 is not `OPEN`.
- PR #7 is draft.
- PR #7 `headRefOid` is not `f8bf087211316506f48155859f3e18edbc7224e4`.
- `refs/heads/codex/m101-build-proto-prompt-command-split` is not `f8bf087211316506f48155859f3e18edbc7224e4`.
- Remote `main` is not `b77418e2fe9b1f6eda213e52f495364bb1861e94` unless C004 refreshes evidence and updates the expected base.
- PR #7 `mergeable` is not `MERGEABLE`.
- A status check or review policy appears that should block merge.
- The user approval text differs from the exact C004 approval text above.

## Rollback Limits

After a GitHub merge mutates `main`, rollback is not automatic and must not be attempted by C004. If the merge needs to be undone, create a separate high-risk revert governance queue with read-only evidence, exact revert command, validation expectations, and explicit user approval.

## Follow-Up Boundary

After any approved PR #7 merge, PR #5 must be refreshed against the new `main` before any later merge packet. M130 should not merge additional PRs without refreshed governance.
