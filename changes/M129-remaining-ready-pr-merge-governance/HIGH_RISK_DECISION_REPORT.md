# M129 C003 High-Risk Decision Report: PR #4 Merge

Prepared at: 2026-05-25T00:16:05+08:00

This report is evidence, not approval. It does not authorize or execute a merge.

## Approved C003 Scope

User-approved local-only C003 action:

```text
Approve M129 C003 decision packet: prepare PR #4 merge high-risk decision packet; do not run gh pr merge, push, edit PRs, mutate Issues, or perform branch surgery.
```

Performed in C003:

- Refreshed PR #4 read-only metadata.
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

- PR: #4
- URL: https://github.com/tiic-tech/openworkflow/pull/4
- Title: `OpenWorkflow M102-selected-change-commit-gate`
- Base: `main`
- PR API base OID: `d0e13f4bba3a847b763d2db3f771659aac3a4fe5`
- Current remote `main` OID: `8656ed135c7a57c5b515572fa06bc082aabdcb95`
- Head branch: `codex/m102-selected-change-commit-gate`
- Head OID: `bd2780b1d5b117b2734e5b732164e5d299bd521a`
- Merge method proposed for C004: merge commit via `--merge`

## Current Evidence

Read-only PR #4 metadata:

- State: `OPEN`
- Draft: `false`
- Mergeability: `MERGEABLE`
- Review decision: empty
- Status check rollup: empty
- Head OID unchanged from C002: yes
- API base OID still reports pre-PR #6 base: yes
- Actual remote `main` matches M129 target base: yes

Remote branches:

- `refs/heads/main`: `8656ed135c7a57c5b515572fa06bc082aabdcb95`
- `refs/heads/codex/m102-selected-change-commit-gate`: `bd2780b1d5b117b2734e5b732164e5d299bd521a`
- PR head OID matches remote head branch: yes

Local merge checkpoint:

- `git merge-base origin/main bd2780b1d5b117b2734e5b732164e5d299bd521a` returned `a0ddcf94b0f856a92218ef07fd323d3eb5bae0a1`.
- `git merge-base --is-ancestor origin/main bd2780b1d5b117b2734e5b732164e5d299bd521a` returned exit `1`, so PR #4 does not contain the PR #6 merge commit.
- `git rev-list --count origin/main..bd2780b1d5b117b2734e5b732164e5d299bd521a` returned `137`.
- `git rev-list --count bd2780b1d5b117b2734e5b732164e5d299bd521a..origin/main` returned `1`.
- `git merge-tree --write-tree origin/main bd2780b1d5b117b2734e5b732164e5d299bd521a` returned clean tree `4961e0e6a803ce623db2faacbf9476c2cc8aff52`.

## Recommendation

Recommend preparing C004 to merge PR #4 with a merge commit, guarded by the expected head SHA:

```bash
gh pr merge 4 --repo tiic-tech/openworkflow --merge --match-head-commit bd2780b1d5b117b2734e5b732164e5d299bd521a
```

Rationale:

- PR #4 is the target selected by C002.
- PR #4 is independent from PR #5/#7 in the observed ancestry matrix.
- PR #4 is the smallest remaining ready PR by ahead count.
- `--merge` preserves the historical commit sequence instead of squashing or rebasing it.
- `--match-head-commit` prevents merging if PR #4 changes head before C004 executes.
- The command does not include `--delete-branch`, so it does not request remote branch deletion.

## Required C004 Approval

Exact approval text required before running the merge command:

```text
Approve M129 C004 merge PR #4: run gh pr merge 4 --repo tiic-tech/openworkflow --merge --match-head-commit bd2780b1d5b117b2734e5b732164e5d299bd521a
```

C004 must verify PR #4 still matches the expected state immediately before running the command.

## Stop Criteria

Stop before C004 if any of these are true:

- PR #4 is not `OPEN`.
- PR #4 is draft.
- PR #4 `headRefOid` is not `bd2780b1d5b117b2734e5b732164e5d299bd521a`.
- `refs/heads/codex/m102-selected-change-commit-gate` is not `bd2780b1d5b117b2734e5b732164e5d299bd521a`.
- Remote `main` is not `8656ed135c7a57c5b515572fa06bc082aabdcb95` unless C004 refreshes evidence and updates the expected base.
- PR #4 `mergeable` is not `MERGEABLE`.
- A status check or review policy appears that should block merge.
- The user approval text differs from the exact C004 approval text above.

## Rollback Limits

After a GitHub merge mutates `main`, rollback is not automatic and must not be attempted by C004. If the merge needs to be undone, create a separate high-risk revert governance queue with read-only evidence, exact revert command, validation expectations, and explicit user approval.

## Follow-Up Boundary

After any approved PR #4 merge, PR #5 and PR #7 must be refreshed against the new `main` before any later merge packet. M129 should not merge additional PRs without refreshed governance.
