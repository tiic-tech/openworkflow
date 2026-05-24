# M134 C001 Git Governance Baseline Inventory

Captured: 2026-05-25T03:18:00+08:00

## Current Baseline

- Current branch: `codex/m134-git-governance-baseline-closure`
- Current branch base: `origin/main`
- Current `origin/main`: `6612aa3e06996ad0151e3686d0c972677fc892c6`
- Current M134 queue commit before C001: `43082a27216082d017804c5e4e2e887769cb2a63`
- Worktree before C001 writes: clean

## GitHub PR State

Merged git-governance PRs now on `main`:

| PR | Title | Merge Commit |
| --- | --- | --- |
| #4 | OpenWorkflow M102-selected-change-commit-gate | `b77418e2fe9b1f6eda213e52f495364bb1861e94` |
| #5 | M117: Git automation remote readiness governance | `6612aa3e06996ad0151e3686d0c972677fc892c6` |
| #6 | M71: Git version control governance | `8656ed135c7a57c5b515572fa06bc082aabdcb95` |
| #7 | M101 shared stack: M105/M106/M115 governance updates | `f98c2013bdb0a50fa5983c6f0ee08cd3fa32e444` |

Open PRs:

| PR | Title | Draft | Head | Head OID | Decision |
| --- | --- | --- | --- | --- | --- |
| #8 | M130 remaining PR #5/#7 merge governance | true | `codex/m130-remaining-pr5-pr7-merge-governance` | `d69eefca8b7d9ae3d510ed47f3e4815a07b74613` | Needs M134 disposition decision. |

PR #8 is the only open PR. It was created before PR #5 merged, so it is not a clean final baseline by itself.

## Local Governance Branches

| Branch | Head | Ancestor of current `origin/main` | Classification |
| --- | --- | --- | --- |
| `codex/m130-remaining-pr5-pr7-merge-governance` | `a6376ec0ad709242229516703553b162bc5eed83` | no | Contains local draft PR evidence not pushed to PR #8. Needs disposition/publication decision only. |
| `codex/m131-git-automation-selected-change-commit-gate-hotfix` | `cbea244a546a9e893e7126dddfc83f7cc6a09ece` | no | Contains selected-change commit-evidence source delta not on current `main`. Needs extraction onto M134. |
| `codex/m132-cc-branch-pr-lifecycle-gate` | `5c256abeb51287c870c3357033e2a1de75cfed6c` | no | Contains M131 plus branch/PR lifecycle source delta and an additional docs report. Needs selective extraction onto M134. |
| `codex/m133-remaining-pr5-merge-governance` | `040f20e41f9152ca25d810e1a8c406fea376c0e6` | no | Contains local M133 audit evidence after PR #5 merge. Needs publication decision if audit branch should be remote. |
| `codex/m134-git-governance-baseline-closure` | `43082a27216082d017804c5e4e2e887769cb2a63` | no | Current local baseline closure branch. Needs local completion and publication. |

## Source Delta Inventory

M131 source files differing from current `origin/main`:

- `packages/cli/src/commands/gitAutomation.ts`
- `packages/cli/src/dev/verifyRuntimeSurface.ts`
- `packages/core/src/git/localGitAutomation.ts`

M132 adds or extends source files differing from current `origin/main`:

- `packages/cli/src/dev/verifyRuntimeSurface.ts`
- `packages/core/src/commands/registry.ts`
- `packages/core/src/validators/validateRepositoryContracts.ts`
- `packages/core/src/workflow/summaryHealth.ts`

M132 also contains generated-surface changes under `.agents/` and `.openworkflow/`; those must not be copied manually. If still needed, they must be regenerated from source templates or contracts.

## Required Remaining Work

1. Extract M131 selected-change commit-evidence behavior onto M134.
2. Extract M132 branch/PR lifecycle gate behavior onto M134.
3. Decide PR #8 disposition after PR #5 merge and M134 supersession.
4. Prepare M134 publication packet.
5. Execute only approved M134 publication and any approved PR #8 disposition.
6. Record final baseline handoff stating whether formal code development can proceed.

## No-Op Or Deferred Work

- Do not merge, rebase, reset, or force-push old local M130/M131/M132/M133 branches.
- Do not use PR #8 as the final baseline without a fresh disposition decision.
- Do not publish M133 audit branch unless explicitly desired; M134 can supersede it with a clean final baseline audit.

## Commands Run

- `gh pr list --repo tiic-tech/openworkflow --state all --json number,url,title,state,isDraft,headRefName,baseRefName,headRefOid,baseRefOid,mergeCommit,mergedAt --limit 50`
- `git branch --list --format='%(refname:short) %(objectname) %(upstream:short)'`
- `git merge-base --is-ancestor <branch-head> origin/main`
- `git diff --name-status origin/main..codex/m132-cc-branch-pr-lifecycle-gate -- packages references changes/M131-git-automation-selected-change-commit-gate-hotfix changes/M132-cc-branch-pr-lifecycle-gate docs`

## Decision

C002 should proceed next. It is the highest-priority source delta because strict selected-change commit evidence is the core invariant needed before further formal code development.
