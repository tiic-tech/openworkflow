# M130 C001 Merge-Readiness Refresh

Captured: 2026-05-25T00:39:28+08:00

This packet refreshes read-only merge-readiness facts for PR #5 and PR #7
after PR #4 merged `main` at
`b77418e2fe9b1f6eda213e52f495364bb1861e94`.

No PR merge, PR edit, Issue mutation, push, force-push, rebase, reset, branch
deletion, branch surgery, or product source change was performed.

## Remote Heads

| Ref | OID |
| --- | --- |
| `origin/main` | `b77418e2fe9b1f6eda213e52f495364bb1861e94` |
| `origin/codex/m117-git-automation-remote-readiness` | `898f0152a4e3e026ee5dcc78d4ef585c722a37b7` |
| `origin/codex/m101-build-proto-prompt-command-split` | `f8bf087211316506f48155859f3e18edbc7224e4` |

## PR Metadata

| PR | Branch | State | Draft | Head OID | API Base OID | Mergeable | Review | Checks |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| #5 | `codex/m117-git-automation-remote-readiness` | OPEN | false | `898f0152a4e3e026ee5dcc78d4ef585c722a37b7` | `d0e13f4bba3a847b763d2db3f771659aac3a4fe5` | MERGEABLE | empty | empty |
| #7 | `codex/m101-build-proto-prompt-command-split` | OPEN | false | `f8bf087211316506f48155859f3e18edbc7224e4` | `d0e13f4bba3a847b763d2db3f771659aac3a4fe5` | MERGEABLE | empty | empty |

GitHub still reports the older base OID `d0e13f4bba3a847b763d2db3f771659aac3a4fe5`
for both PRs. It has not caught up to remote `main` at
`b77418e2fe9b1f6eda213e52f495364bb1861e94` in the PR metadata returned by
`gh pr list`.

## Local Ancestry

| Target | Merge base with `origin/main` | Behind main | Ahead of main | `origin/main` ancestor of target | Merge-tree result |
| --- | --- | ---: | ---: | --- | --- |
| PR #5 | `5a4fc221f4243924ba4cc0c3f5158b07ecc8d394` | 3 | 61 | no | clean tree `9d1238ea3653b29172f40ca7933f2f2d9db2aea3` |
| PR #7 | `5a4fc221f4243924ba4cc0c3f5158b07ecc8d394` | 3 | 49 | no | clean tree `b08f45c07bdb3aca44c1e45bea7b37da1ba2cae3` |

Both PR heads are behind the current `origin/main` by 3 commits and do not
contain `b77418e2fe9b1f6eda213e52f495364bb1861e94` as an ancestor. Local
`git merge-tree --write-tree origin/main <head>` returned a tree OID for both
heads, which indicates no merge-tree conflict was reported by this command.

## PR #7 To PR #5 Relationship

`origin/codex/m101-build-proto-prompt-command-split` remains an ancestor of
`origin/codex/m117-git-automation-remote-readiness`.

| Relationship | Result |
| --- | --- |
| PR #7 head ancestor of PR #5 head | yes |
| PR #5 head ancestor of PR #7 head | no |
| Merge base | `f8bf087211316506f48155859f3e18edbc7224e4` |
| PR #5 relative to PR #7 | 12 commits ahead, 0 behind |

## C002 Readiness

C002 can proceed to choose a next merge target or stop with blockers. It should
use these facts:

- PR #5 and PR #7 are open, non-draft, and reported MERGEABLE by GitHub.
- The remote head OIDs match the PR API head OIDs.
- PR #7 remains contained in PR #5, so merging PR #5 first may subsume PR #7's
  branch content, while merging PR #7 first preserves the staged stack order.
- Both PR metadata records still report an old base OID, so C002 should treat
  the local `origin/main` calculations as the current base evidence.
- No merge is authorized by this packet.

## Commands Run

- `gh pr list --repo tiic-tech/openworkflow --state open --json number,url,title,isDraft,headRefName,baseRefName,headRefOid,baseRefOid,mergeable,reviewDecision,statusCheckRollup --limit 20`
- `git ls-remote origin refs/heads/main refs/heads/codex/m117-git-automation-remote-readiness refs/heads/codex/m101-build-proto-prompt-command-split`
- `git fetch origin main codex/m117-git-automation-remote-readiness codex/m101-build-proto-prompt-command-split`
- `git merge-base origin/main origin/codex/m117-git-automation-remote-readiness`
- `git rev-list --left-right --count origin/main...origin/codex/m117-git-automation-remote-readiness`
- `git merge-tree --write-tree origin/main origin/codex/m117-git-automation-remote-readiness`
- `git merge-base --is-ancestor origin/main origin/codex/m117-git-automation-remote-readiness`
- `git merge-base origin/main origin/codex/m101-build-proto-prompt-command-split`
- `git rev-list --left-right --count origin/main...origin/codex/m101-build-proto-prompt-command-split`
- `git merge-tree --write-tree origin/main origin/codex/m101-build-proto-prompt-command-split`
- `git merge-base --is-ancestor origin/main origin/codex/m101-build-proto-prompt-command-split`
- `git merge-base --is-ancestor origin/codex/m101-build-proto-prompt-command-split origin/codex/m117-git-automation-remote-readiness`
- `git merge-base --is-ancestor origin/codex/m117-git-automation-remote-readiness origin/codex/m101-build-proto-prompt-command-split`
- `git merge-base origin/codex/m117-git-automation-remote-readiness origin/codex/m101-build-proto-prompt-command-split`
- `git rev-list --left-right --count origin/codex/m101-build-proto-prompt-command-split...origin/codex/m117-git-automation-remote-readiness`
