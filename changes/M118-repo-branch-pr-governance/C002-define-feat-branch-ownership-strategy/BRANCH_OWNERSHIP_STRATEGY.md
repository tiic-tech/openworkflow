# Branch Ownership Strategy

Captured: 2026-05-23

Current branch: `codex/m118-repo-branch-pr-governance`

Remote mutation: not performed.

## Decision

Use the existing local branch heads as a non-destructive stacked PR train for planning. Do not rewrite history or move branch pointers inside M118. Queues that do not already have a clean branch boundary should be classified, summarized, and deferred to a later approved repair queue if they need independent PR branches.

This is a planning strategy, not approval to push or open PRs.

## Existing Stacked Train

These branches are all ancestors of current HEAD and can be used as current local review boundaries without moving branch pointers:

| Order | Base | Head | Commits | Disposition |
| ---: | --- | --- | ---: | --- |
| 1 | `main` | `codex/m53-self-dogfood-init` | 32 | Historical governance base; needs summary before remote planning. |
| 2 | `codex/m53-self-dogfood-init` | `codex/m71-git-version-governance` | 34 | Git governance stack; local PR summary exists, queue status still active. |
| 3 | `codex/m71-git-version-governance` | `codex/m54-decompose-select-change-planning` | 16 | Planning command stack; queue still active with one incomplete candidate. |
| 4 | `codex/m54-decompose-select-change-planning` | `codex/m73-workflow-blueprint-runtime-alignment` | 85 | Large stacked workflow/proto/validation train; not a clean single-feature PR. |
| 5 | `codex/m73-workflow-blueprint-runtime-alignment` | `codex/m98-dailin-grade-vision2prompt-pipeline` | 6 | M98 branch exists locally; needs summary/evidence audit. |
| 6 | `codex/m98-dailin-grade-vision2prompt-pipeline` | `codex/m99-smart-city-m98-e2e-replay` | 7 | M99 branch exists locally; needs summary/evidence audit. |
| 7 | `codex/m99-smart-city-m98-e2e-replay` | `codex/m100-dailin-grade-image-prompt-paragraphs` | 9 | M100 has missing validation evidence in summary dry-run. |
| 8 | `codex/m100-dailin-grade-image-prompt-paragraphs` | `codex/m102-selected-change-commit-gate` | 13 | M102 is a clean strict-gate local PR candidate. |
| 9 | `codex/m102-selected-change-commit-gate` | `codex/m101-build-proto-prompt-command-split` | 49 | M101 branch contains later M105/M106/M114/M115/M117 setup work; not clean. |
| 10 | `codex/m101-build-proto-prompt-command-split` | `codex/m117-git-automation-remote-readiness` | 11 | M117 is a clean strict-gate local PR candidate after M101 stack is handled. |
| 11 | `codex/m117-git-automation-remote-readiness` | `codex/m118-repo-branch-pr-governance` | 0 | M118 is current planning work and should not be remotely published yet. |

The train above is safe to describe because it uses existing refs and ancestry only. It does not require branch creation, branch pointer movement, rebase, cherry-pick, or reset.

## Clean Local PR Candidates

These are the strongest candidates for C004 remote planning after dirty paths are resolved:

- `M102-selected-change-commit-gate`: completed, strict gate, local branch, local PR summary. As a stacked PR, base should be `codex/m100-dailin-grade-image-prompt-paragraphs`, not `main`, unless later branch repair is approved.
- `M117-git-automation-remote-readiness`: completed, strict gate, local branch, local PR summary. As a stacked PR, base should be `codex/m101-build-proto-prompt-command-split`, not `main`, unless later branch repair is approved.

## Stacked Continuation Groups

These groups should not be represented as independent clean PR branches without later approval:

- M73 group: M73, M74, M84, M85, M86, M87, M88, M90, M92, M93, M97 share or depend on `codex/m73-workflow-blueprint-runtime-alignment`.
- M101 group: M101, M105, M106, M114, M115 and the M117 queue creation commit share or depend on `codex/m101-build-proto-prompt-command-split`.

Recommended default: keep these as stacked review slices for planning, then decide later whether to publish stacked PRs or perform an approved repair queue.

## Repair-Required Queues

These need evidence, status, YAML, or branch repair before PR publication:

- M54: active with 12/13 done.
- M68, M69, M70, M74, M114: active and incomplete.
- M73: status completed but candidate count is 4/5 done.
- M88, M92, M93, M98, M99: all candidates done but queue status remains active or next pointers remain set.
- M100: summary dry-run warned no validation evidence.
- M101: early candidates report commit not recorded; branch also includes later stacked queues.
- M113: malformed YAML blocks parsing.
- M118: current governance queue, not ready for PR.

## Branches Outside Current HEAD

Several older local branches are not ancestors of current HEAD, including M05-M19 style branches and some older Codex branches. They should not be folded into the M118 current-stack PR plan without a separate historical reconciliation pass.

## Forbidden In M118

M118 must not perform `git push`, `gh pr create`, `gh pr edit`, Issue mutation, merge, rebase, reset, force-push, branch deletion, branch pointer movement, or cherry-pick.

## Handoff To C003

C003 should generate or refresh local PR-ready summaries only for queues whose evidence supports it. It should mark M100/M101/M113 and incomplete active queues as blocked or not ready instead of creating misleading PR readiness.

## Handoff To C004

C004 should produce remote plans in this order:

1. M102 as the first clean strict-gate stacked PR candidate.
2. M117 as the second clean strict-gate candidate after M101 stack disposition is explicit.
3. M71 if its active status is reconciled with all candidates done.
4. Larger stacked groups only after C003 summaries and explicit user approval for stacked PR publication.

Actual push or PR creation belongs to M119 and requires operation-level approval.
