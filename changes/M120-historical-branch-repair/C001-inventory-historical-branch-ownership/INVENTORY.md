# M120 C001 Historical Branch Ownership Inventory

## Snapshot

- Captured at: `2026-05-23`
- Current branch: `codex/m120-historical-branch-repair`
- Working tree state during inventory: dirty only with M120 C001 planning/evidence files
- Remote: `origin`
- Current open publication PR: `https://github.com/tiic-tech/openworkflow/pull/4`
- PR #4 state: `OPEN`
- PR #4 draft: `true`
- PR #4 base/head: `main <- codex/m102-selected-change-commit-gate`

## Local Branches

Local `codex/m*` branches observed:

- `codex/m100-dailin-grade-image-prompt-paragraphs`
- `codex/m101-build-proto-prompt-command-split`
- `codex/m102-selected-change-commit-gate`
- `codex/m117-git-automation-remote-readiness`
- `codex/m118-repo-branch-pr-governance`
- `codex/m119-approved-remote-pr-publication`
- `codex/m120-historical-branch-repair`
- `codex/m14-python-to-typescript-script-migration`
- `codex/m15-interactive-vision-design-flow-implementation`
- `codex/m16-prototype-creation-skill-upgrade-fixes`
- `codex/m17-tune-orchestration-internal-decision`
- `codex/m18-e2e-friction-fixes`
- `codex/m19-command-display-label-cleanup`
- `codex/m22-project-clean-command`
- `codex/m48-handoff-quality-summary`
- `codex/m49-single-handoff-entry`
- `codex/m50-context-handoff-mode`
- `codex/m51-agent-first-e2e-suite`
- `codex/m53-self-dogfood-init`
- `codex/m54-decompose-select-change-planning`
- `codex/m71-git-version-governance`
- `codex/m73-workflow-blueprint-runtime-alignment`
- `codex/m98-dailin-grade-vision2prompt-pipeline`
- `codex/m99-smart-city-m98-e2e-replay`

Remote `codex/*` branches observed:

- `codex/m102-selected-change-commit-gate` at `bd2780b1d5b117b2734e5b732164e5d299bd521a`
- `codex/m51-agent-first-e2e-suite` at `14ede8a476c77c7aac4c4158824162de0d25b485`

## Existing GitHub PRs

- PR #4: `OPEN`, draft `true`, `main <- codex/m102-selected-change-commit-gate`, `https://github.com/tiic-tech/openworkflow/pull/4`
- PR #3: `MERGED`, `main <- codex/m51-agent-first-e2e-suite`
- PR #2: `MERGED`, `main <- codex/m21-npm-package-release-readiness`
- PR #1: `MERGED`, `main <- codex/m20-workflow-e2e-regression`

## PR-Ready Summary Ownership

| Plan | Recorded branch boundary | Summary path | Branch exists | Summary exists on branch |
| --- | --- | --- | --- | --- |
| M102-selected-change-commit-gate | `codex/m102-selected-change-commit-gate` | `changes/M102-selected-change-commit-gate/PR_READY_SUMMARY.md` | yes | yes |
| M105-m104-direct-trust-gate-fixes | `codex/m101-build-proto-prompt-command-split` | `changes/M105-m104-direct-trust-gate-fixes/PR_READY_SUMMARY.md` | yes | no |
| M106-agent-resume-cockpit | `codex/m101-build-proto-prompt-command-split` | `changes/M106-agent-resume-cockpit/PR_READY_SUMMARY.md` | yes | no |
| M115-internal-coder-quality-governance | `codex/m101-build-proto-prompt-command-split` | `changes/M115-internal-coder-quality-governance/PR_READY_SUMMARY.md` | yes | no |
| M117-git-automation-remote-readiness | `codex/m117-git-automation-remote-readiness` | `changes/M117-git-automation-remote-readiness/PR_READY_SUMMARY.md` | yes | no |
| M71-git-version-control-governance | `codex/m71-git-version-governance` | `changes/M71-git-version-control-governance/PR_READY_SUMMARY.md` | yes | yes |

## Branch Boundary Groups

Independent branch boundaries with branch-local PR-ready summary present:

- `codex/m102-selected-change-commit-gate`: M102, already published as PR #4.
- `codex/m71-git-version-governance`: M71, local branch and summary present.

Independent branch boundary with missing branch-local PR-ready summary:

- `codex/m117-git-automation-remote-readiness`: M117 branch exists, but its
  `PR_READY_SUMMARY.md` is absent on that branch.

Shared historical branch boundary:

- `codex/m101-build-proto-prompt-command-split`: M105, M106, M115, plus other M101-derived active
  queues such as M113 and M114. The current M105/M106/M115 PR-ready summaries are not present on
  that branch, and publishing these queues as separate PRs would require either accepting the shared
  stack or creating repaired branch/evidence boundaries.

Older stacked branch:

- `codex/m71-git-version-governance` has branch-local evidence but is 66 commits ahead of `main`
  and includes early governance commits that predate strict commit evidence. It may be publishable
  as an intentionally coupled historical stack, but that policy decision belongs to C002.

## Repair Inputs

Low-risk evidence repair candidates:

- M117: regenerate or restore `changes/M117-git-automation-remote-readiness/PR_READY_SUMMARY.md`
  on `codex/m117-git-automation-remote-readiness`, then rerun remote-plan.

Policy decision candidates:

- M71: decide whether the older 66-commit governance stack is acceptable as one review branch.
- M105/M106/M115: decide whether shared `codex/m101-build-proto-prompt-command-split` ownership is
  acceptable, or whether each queue needs a repaired branch boundary.

High-risk candidates:

- Any cherry-pick, rebase, reset, branch pointer move, force-push, remote branch deletion, PR edit,
  ready-for-review transition, or merge remains unapproved and requires a high-risk report plus exact
  operation-level approval.

## C001 Result

C001 satisfies the inventory requirement. It does not repair branches, create or edit PRs, push,
rewrite history, mutate Issues, or move branch pointers.

Recommended next candidate: C002, to decide the historical branch repair policy and stop boundaries.
