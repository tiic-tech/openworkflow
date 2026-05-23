# Repo Git History Inventory

Captured: 2026-05-23

Branch: `codex/m118-repo-branch-pr-governance`

Remote: `origin` -> `https://github.com/tiic-tech/openworkflow.git`

Remote mutation: not performed.

## Executive Summary

- `main..HEAD` contains 262 local commits.
- 28 candidate queues parse successfully.
- 1 candidate queue is malformed: `changes/M113-spicyclaw-rename-and-compatibility/CANDIDATE_CHANGES.yaml`.
- 50 local/remote refs are visible.
- Remote refs are sparse: `origin/main`, `origin/codex/m20-workflow-e2e-regression`, `origin/codex/m21-npm-package-release-readiness`, and `origin/codex/m51-agent-first-e2e-suite`.
- Local PR-ready summaries exist for M71, M102, M106, M115, and M117.
- Most completed queues are local-only and not yet remotely governed.

## Dirty Paths

Current untracked paths are local governance artifacts:

- `changes/M102-selected-change-commit-gate/PR_READY_SUMMARY.md`
- `changes/M106-agent-resume-cockpit/PR_READY_SUMMARY.md`
- `changes/M115-internal-coder-quality-governance/PR_READY_SUMMARY.md`
- `changes/M117-git-automation-remote-readiness/PR_READY_SUMMARY.md`
- `changes/M118-repo-branch-pr-governance/`

These dirty paths block reliable remote-plan probes until committed, staged intentionally, or otherwise accounted for.

## Commit Groups

`main..HEAD` commit grouping by subject token:

| Group | Commits |
| --- | ---: |
| legacy-descriptive | 52 |
| M54 | 16 |
| M70 | 1 |
| M71 | 32 |
| M72 | 1 |
| M73 | 13 |
| M74 | 3 |
| M84 | 8 |
| M85 | 10 |
| M86 | 10 |
| M87 | 11 |
| M88 | 13 |
| M90 | 13 |
| M92 | 3 |
| M98 | 1 |
| M99 | 3 |
| M101 | 4 |
| M102 | 9 |
| M105 | 8 |
| M106 | 12 |
| M114 | 8 |
| M115 | 16 |
| M117 | 12 |
| unclassified | 3 |

First commit in range: `1f51ef8 docs: plan self dogfood init`

HEAD commit: `4cccdf2 M117-git-automation-remote-readiness/C005 Record commit evidence`

## Queue Inventory

| Plan | Status | Branch Boundary | Done | PR Summary | Gate | PR Planning Disposition |
| --- | --- | --- | ---: | --- | --- | --- |
| M54-decompose-select-change-planning | active | `codex/m54-decompose-select-change-planning` | 12/13 | no | migration | Active queue; not PR-ready until remaining candidate state is resolved. |
| M59-proto-redesign-planning-dogfood | active | none | 7/7 | no | migration | Completed work but no branch boundary; historical migration planning needed. |
| M68-post-proto-workflow-planning | active | none | 3/7 | no | migration | Active incomplete queue; not PR-ready. |
| M69-skill-system-lifecycle-planning | active | none | 5/7 | no | migration | Active incomplete queue; not PR-ready. |
| M70-high-risk-governance-planning | active | none | 4/7 | no | migration | Active incomplete queue; not PR-ready. |
| M71-git-version-control-governance | active | `codex/m71-git-version-governance` | 20/20 | yes | migration | Local PR summary exists; queue status still active despite all candidates done. |
| M73-workflow-blueprint-runtime-alignment | completed | `codex/m73-workflow-blueprint-runtime-alignment` | 4/5 | no | migration | Completed status conflicts with 4/5 done; needs evidence/status audit before PR. |
| M74-front-chain-command-quality-review | active | `codex/m73-workflow-blueprint-runtime-alignment` | 1/4 | no | migration | Stacked on M73 branch and incomplete. |
| M84-vision-delayed-compile-proto-readiness | completed | `codex/m73-workflow-blueprint-runtime-alignment` | 4/4 | no | migration | Completed but stacked on M73 branch; branch strategy required. |
| M85-validation-proto-target-contract | completed | `codex/m73-workflow-blueprint-runtime-alignment` | 5/5 | no | migration | Completed but stacked on M73 branch; branch strategy required. |
| M86-proto-strategy-prompt-compiler | completed | `codex/m73-workflow-blueprint-runtime-alignment` | 5/5 | no | migration | Completed but stacked on M73 branch; branch strategy required. |
| M87-vision2prompt-post-validate-gate | completed | `codex/m73-workflow-blueprint-runtime-alignment` | 4/4 | no | migration | Completed but stacked on M73 branch; branch strategy required. |
| M88-tune-product-system-inheritance | active | `codex/m73-workflow-blueprint-runtime-alignment` | 4/4 | no | migration | All candidates done but queue status active; stacked on M73 branch. |
| M90-discovery-loop-e2e-dogfood | completed | `codex/m73-workflow-blueprint-runtime-alignment` | 4/4 | no | migration | Completed but stacked on M73 branch; branch strategy required. |
| M92-smart-city-real-discovery-e2e-dogfood | active | `codex/m73-workflow-blueprint-runtime-alignment` | 2/2 | no | migration | All candidates done but queue status active; stacked on M73 branch. |
| M93-proto-product-archetype-reality-gate | active | `codex/m73-workflow-blueprint-runtime-alignment` | 4/4 | no | migration | All candidates done but next points to C001; status/evidence audit needed. |
| M97-smart-city-product-reality-dogfood | complete | `codex/m73-workflow-blueprint-runtime-alignment` | 4/4 | no | migration | Completed but stacked on M73 branch; branch strategy required. |
| M98-dailin-grade-vision2prompt-pipeline | active | `codex/m98-dailin-grade-vision2prompt-pipeline` | 6/6 | no | migration | All candidates done but queue status active; needs local PR summary/evidence audit. |
| M99-smart-city-m98-e2e-replay | active | `codex/m99-smart-city-m98-e2e-replay` | 3/3 | no | migration | All candidates done but queue status active; needs local PR summary/evidence audit. |
| M100-dailin-grade-image-prompt-paragraphs | complete | `codex/m100-dailin-grade-image-prompt-paragraphs` | 7/7 | no | migration | Summary dry-run warned no validation evidence; not PR-ready without evidence repair. |
| M101-build-proto-prompt-command-split | completed | `codex/m101-build-proto-prompt-command-split` | 7/7 | no | migration | Completed but early candidates lack recorded commits; branch contains later stacked queues. |
| M102-selected-change-commit-gate | completed | `codex/m102-selected-change-commit-gate` | 4/4 | yes | strict | Good local PR-summary candidate; branch exists locally, remote absent. |
| M105-m104-direct-trust-gate-fixes | complete | `codex/m101-build-proto-prompt-command-split` | 4/4 | no | strict | Completed but stacked on M101 branch; local summary not yet generated. |
| M106-agent-resume-cockpit | completed | `codex/m101-build-proto-prompt-command-split` | 5/5 | yes | strict | Local PR summary exists but branch boundary is M101 continuation; strategy required. |
| M113-spicyclaw-rename-and-compatibility | malformed | unknown | unknown | no | unknown | YAML parse error blocks PR planning until repaired or excluded. |
| M114-engineering-quality-foundation | active | `codex/m101-build-proto-prompt-command-split` | 3/8 | no | strict | Active incomplete queue; not PR-ready. |
| M115-internal-coder-quality-governance | completed | `codex/m101-build-proto-prompt-command-split` | 7/7 | yes | strict | Local PR summary exists but branch boundary is M101 continuation; strategy required. |
| M117-git-automation-remote-readiness | completed | `codex/m117-git-automation-remote-readiness` | 5/5 | yes | strict | Best current pilot for remote planning after dirty paths and simulator evidence are resolved. |
| M118-repo-branch-pr-governance | active | `codex/m118-repo-branch-pr-governance` | 0/4 | no | strict | Current governance queue; not a product PR until C001-C004 finish. |

## Branch Inventory

Local feat branches with clear queue alignment:

- `codex/m54-decompose-select-change-planning`
- `codex/m71-git-version-governance`
- `codex/m73-workflow-blueprint-runtime-alignment`
- `codex/m98-dailin-grade-vision2prompt-pipeline`
- `codex/m99-smart-city-m98-e2e-replay`
- `codex/m100-dailin-grade-image-prompt-paragraphs`
- `codex/m101-build-proto-prompt-command-split`
- `codex/m102-selected-change-commit-gate`
- `codex/m117-git-automation-remote-readiness`
- `codex/m118-repo-branch-pr-governance`

Remote feat branches currently visible:

- `origin/codex/m20-workflow-e2e-regression`
- `origin/codex/m21-npm-package-release-readiness`
- `origin/codex/m51-agent-first-e2e-suite`

The current local M118/M117 stack is not present on remote.

## PR Planning Classes

Ready for deeper local PR planning:

- M102: completed, strict gate, local branch, local PR summary.
- M117: completed, strict gate, local branch, local PR summary.

Potential PR planning after branch strategy:

- M71: local PR summary exists, all candidates done, but queue status remains active and gate is migration-mode.
- M106: local PR summary exists, completed, strict gate, but branch boundary is the M101 continuation branch.
- M115: local PR summary exists, completed, strict gate, but branch boundary is the M101 continuation branch.

Not PR-ready until evidence or status repair:

- M100: completed but PR summary dry-run warned no validation evidence.
- M101: completed but early candidates report commit not recorded, and later queues stack on its branch.
- M113: malformed YAML blocks parsing.
- M114, M54, M68, M69, M70, M74, M118: active and incomplete.

Historical stacked batch needing C002 branch strategy:

- M73, M84, M85, M86, M87, M88, M90, M92, M93, M97 share `codex/m73-workflow-blueprint-runtime-alignment`.
- M105, M106, M114, M115 share `codex/m101-build-proto-prompt-command-split`.

## Immediate Implications For M118

1. C002 should decide whether stacked queues are reviewed as stacked PRs or require later approved branch repair.
2. C003 should generate more PR summaries only for queues whose evidence is strong enough; it should not hide missing validation or missing commit evidence.
3. C004 should start remote-plan probes with M102 or M117, because they have the cleanest branch identity and local PR-ready summaries.
4. Any real push or GitHub PR creation belongs to M119 after explicit approval.
