# M129 C001 Merge-Readiness Refresh

Captured: 2026-05-24T18:21:14+08:00

This packet refreshes read-only merge-readiness facts for remaining open PRs after PR #6 merged into `main`.

No merge, push, PR edit, Issue mutation, branch surgery, reset, rebase, checkout, or product source change was performed.

## Base

- Remote: `origin`
- Base branch: `main`
- Actual remote/main head: `8656ed135c7a57c5b515572fa06bc082aabdcb95`
- Local `origin/main` after fetch: `8656ed135c7a57c5b515572fa06bc082aabdcb95`
- Source merge: PR #6 merge commit `8656ed135c7a57c5b515572fa06bc082aabdcb95`

## PR API Metadata

GitHub PR API still reports the older base OID `d0e13f4bba3a847b763d2db3f771659aac3a4fe5` for PR #4, PR #5, and PR #7. The actual remote `main` head is `8656ed135c7a57c5b515572fa06bc082aabdcb95`, so merge-governance must use the refreshed remote main fact rather than the lagging `baseRefOid` field.

| PR | Branch | Head OID | Draft | Mergeable | Review | Checks |
| --- | --- | --- | --- | --- | --- | --- |
| #4 | `codex/m102-selected-change-commit-gate` | `bd2780b1d5b117b2734e5b732164e5d299bd521a` | false | `MERGEABLE` | empty | none reported |
| #5 | `codex/m117-git-automation-remote-readiness` | `898f0152a4e3e026ee5dcc78d4ef585c722a37b7` | false | `MERGEABLE` | empty | none reported |
| #7 | `codex/m101-build-proto-prompt-command-split` | `f8bf087211316506f48155859f3e18edbc7224e4` | false | `MERGEABLE` | empty | none reported |

## Remote Head Verification

| Ref | Remote OID |
| --- | --- |
| `refs/heads/main` | `8656ed135c7a57c5b515572fa06bc082aabdcb95` |
| `refs/heads/codex/m102-selected-change-commit-gate` | `bd2780b1d5b117b2734e5b732164e5d299bd521a` |
| `refs/heads/codex/m117-git-automation-remote-readiness` | `898f0152a4e3e026ee5dcc78d4ef585c722a37b7` |
| `refs/heads/codex/m101-build-proto-prompt-command-split` | `f8bf087211316506f48155859f3e18edbc7224e4` |

All remote PR head branches match their PR API head OIDs.

## Local Ancestry And Merge-Tree Signals

All PR heads are present locally. Each PR branch is one commit behind new `origin/main` because none contains the PR #6 merge commit itself. For all three PRs, `git merge-tree --write-tree origin/main <head-oid>` exited `0` and returned a tree OID, indicating no local merge-tree conflict signal.

| PR | Merge Base With `origin/main` | `origin/main` Ancestor Of Head | Ahead | Behind | Merge-Tree Status | Merge-Tree Output |
| --- | --- | --- | --- | --- | --- | --- |
| #4 | `a0ddcf94b0f856a92218ef07fd323d3eb5bae0a1` | no | 137 | 1 | 0 | `4961e0e6a803ce623db2faacbf9476c2cc8aff52` |
| #5 | `a0ddcf94b0f856a92218ef07fd323d3eb5bae0a1` | no | 197 | 1 | 0 | `e6dd19273a094b0e79d411d49de8b57aefb3de5e` |
| #7 | `a0ddcf94b0f856a92218ef07fd323d3eb5bae0a1` | no | 185 | 1 | 0 | `e70f5ae555b03b1ee3f1a3f32f94a0e8c94b55c9` |

## C002 Readiness

C002 can choose the next merge target. Current evidence shows:

- PR #4, PR #5, and PR #7 remain open, non-draft, and API-mergeable.
- No status checks are reported for the three PRs.
- All remote head branches still exist at the PR head OIDs.
- All three have clean local merge-tree signals against refreshed `origin/main`.
- All three are behind the new main by the PR #6 merge commit, so C002 should account for dependency order, branch size, and blast radius rather than treating the lagging PR API base OID as authoritative.

C001 does not recommend a merge target and does not approve a merge. Target selection belongs to C002, and merge approval remains gated by C003/C004.

## Commands Run

- `gh pr list --repo tiic-tech/openworkflow --state open --json number,url,title,isDraft,headRefName,baseRefName,headRefOid,baseRefOid,mergeable,reviewDecision,statusCheckRollup --limit 20`
- `git ls-remote origin refs/heads/main refs/heads/codex/m102-selected-change-commit-gate refs/heads/codex/m117-git-automation-remote-readiness refs/heads/codex/m101-build-proto-prompt-command-split`
- `git fetch origin main`
- `git rev-parse origin/main`
- `git merge-base origin/main <head-oid>`
- `git merge-base --is-ancestor origin/main <head-oid>`
- `git rev-list --count origin/main..<head-oid>`
- `git rev-list --count <head-oid>..origin/main`
- `git merge-tree --write-tree origin/main <head-oid>`
