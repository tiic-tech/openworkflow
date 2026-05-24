# M128 C001 Merge-Readiness Inventory

Captured at: 2026-05-24T12:26:24+08:00

Scope: read-only merge-readiness inventory for PR #4, PR #5, PR #6, and PR #7.

No merge, push, PR edit, Issue mutation, branch switch, branch deletion, rebase, reset, force-push, split/surgery, or product source change was performed.

## Summary

All four target PRs remain open, non-draft, and mergeable according to `gh pr list`. Their base OID is still `d0e13f4bba3a847b763d2db3f771659aac3a4fe5`, matching local `origin/main`. Each remote head branch exists and matches the PR head OID. `origin/main` is an ancestor of each head, and `git merge-tree --write-tree origin/main <head>` exited successfully for all four targets.

C002 can proceed to choose the first merge target. Because every target currently has an empty status-check rollup and no review decision, C002 must explicitly decide whether the first merge follows repaired publication order or older PR creation order before any high-risk merge packet is prepared.

Recommended C002 comparison order:

1. PR #5, because M120 repaired publication order ranked M117 before M71 and the shared M101 group.
2. PR #4, because it is the earlier M102 pilot PR and is already ready.
3. PR #6, because M71 is a 66-commit historical governance stack.
4. PR #7, because it is the shared M101-derived stack and should remain last unless C002 finds stronger evidence.

## PR Facts

| PR | Branch | Head OID | Base OID | Draft | Mergeable | Review | Checks |
| --- | --- | --- | --- | --- | --- | --- | --- |
| #4 | `codex/m102-selected-change-commit-gate` | `bd2780b1d5b117b2734e5b732164e5d299bd521a` | `d0e13f4bba3a847b763d2db3f771659aac3a4fe5` | false | MERGEABLE | empty | empty |
| #5 | `codex/m117-git-automation-remote-readiness` | `898f0152a4e3e026ee5dcc78d4ef585c722a37b7` | `d0e13f4bba3a847b763d2db3f771659aac3a4fe5` | false | MERGEABLE | empty | empty |
| #6 | `codex/m71-git-version-governance` | `a0ddcf94b0f856a92218ef07fd323d3eb5bae0a1` | `d0e13f4bba3a847b763d2db3f771659aac3a4fe5` | false | MERGEABLE | empty | empty |
| #7 | `codex/m101-build-proto-prompt-command-split` | `f8bf087211316506f48155859f3e18edbc7224e4` | `d0e13f4bba3a847b763d2db3f771659aac3a4fe5` | false | MERGEABLE | empty | empty |

## Remote Head Verification

| Branch | Remote OID | Matches PR Head |
| --- | --- | --- |
| `codex/m102-selected-change-commit-gate` | `bd2780b1d5b117b2734e5b732164e5d299bd521a` | yes |
| `codex/m117-git-automation-remote-readiness` | `898f0152a4e3e026ee5dcc78d4ef585c722a37b7` | yes |
| `codex/m71-git-version-governance` | `a0ddcf94b0f856a92218ef07fd323d3eb5bae0a1` | yes |
| `codex/m101-build-proto-prompt-command-split` | `f8bf087211316506f48155859f3e18edbc7224e4` | yes |

## Local Merge Probes

Local `origin/main`: `d0e13f4bba3a847b763d2db3f771659aac3a4fe5`

| PR | `origin/main` Ancestor | Commits Ahead | Merge-Tree Result |
| --- | --- | --- | --- |
| #4 | yes | 203 | clean tree `4961e0e6a803ce623db2faacbf9476c2cc8aff52` |
| #5 | yes | 263 | clean tree `e6dd19273a094b0e79d411d49de8b57aefb3de5e` |
| #6 | yes | 66 | clean tree `bbf7b9e12650cd3d984f7fa379e8ecd3871bf5e3` |
| #7 | yes | 251 | clean tree `e70f5ae555b03b1ee3f1a3f32f94a0e8c94b55c9` |

## Commands Run

- `gh pr list --repo tiic-tech/openworkflow --state open --json number,url,title,isDraft,headRefName,baseRefName,headRefOid,baseRefOid,mergeable,reviewDecision,statusCheckRollup --limit 20`
- `git ls-remote --heads origin codex/m102-selected-change-commit-gate codex/m117-git-automation-remote-readiness codex/m71-git-version-governance codex/m101-build-proto-prompt-command-split`
- `git rev-parse origin/main`
- `git merge-base --is-ancestor origin/main <head-oid>` for each target head
- `git rev-list --count origin/main..<head-oid>` for each target head
- `git merge-tree --write-tree origin/main <head-oid>` for each target head

## C002 Readiness

C002 is ready. It should decide exactly one first merge target or record blockers. C002 must not execute a merge; merge execution remains high-risk and requires a later exact approval packet.
