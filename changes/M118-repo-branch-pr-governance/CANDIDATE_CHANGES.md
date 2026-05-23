# Candidate Changes - M118 Repo Branch PR Governance

Source of truth: `changes/M118-repo-branch-pr-governance/CANDIDATE_CHANGES.yaml`.

## Boundary

This temporary queue covers local commit ownership audit, feat branch ownership planning, local PR-ready summaries, and an ordered remote push/PR plan after M117. It does not authorize push, GitHub PR creation or editing, Issue mutation, merge, rebase, reset, force-push, branch deletion, or historical commit rewriting.

Branch boundary: `codex/m118-repo-branch-pr-governance`

Creation context: the queue was opened from `codex/m117-git-automation-remote-readiness` immediately after M117 completed, then the local branch `codex/m118-repo-branch-pr-governance` was created from the M117 HEAD. The branch has not been pushed and no remote PR was opened.

## Selection Policy

Next recommended candidate: `C001`.

Selected candidate: none.

Select `C001` first because the repo needs a factual inventory of commits, queues, branches, remote refs, and local PR summaries before branch or remote governance can be trusted.

## Observed State

- Initial branch: `codex/m117-git-automation-remote-readiness`
- Current branch after setup: `codex/m118-repo-branch-pr-governance`
- Remote: `origin` -> `https://github.com/tiic-tech/openworkflow.git`
- GitHub CLI auth: authenticated as `tiic-tech`
- Completed queue just recovered: `M117-git-automation-remote-readiness`
- Local PR-ready summaries written during setup:
  - `changes/M102-selected-change-commit-gate/PR_READY_SUMMARY.md`
  - `changes/M106-agent-resume-cockpit/PR_READY_SUMMARY.md`
  - `changes/M115-internal-coder-quality-governance/PR_READY_SUMMARY.md`
  - `changes/M117-git-automation-remote-readiness/PR_READY_SUMMARY.md`

Read-only M117 remote-plan probe is currently blocked by dirty local PR summary files, unknown remote base head in the probe result, and missing simulator evidence. No remote mutation was performed.

## Candidates

### C001 - Build Local Commit, Queue, And Branch Ownership Inventory

Status: `done`

Create an auditable inventory that separates queue ownership, branch ownership, remote presence, PR summary readiness, and ambiguous stacked-branch work.

Artifacts:

- `changes/M118-repo-branch-pr-governance/C001-build-local-commit-queue-and-branch-ownership-inventory/SELECTED_CHANGE.yaml`
- `changes/M118-repo-branch-pr-governance/C001-build-local-commit-queue-and-branch-ownership-inventory/ATOM_TASKS.yaml`
- `changes/M118-repo-branch-pr-governance/C001-build-local-commit-queue-and-branch-ownership-inventory/IMPLEMENTATION_BRIEF.md`
- `changes/M118-repo-branch-pr-governance/C001-build-local-commit-queue-and-branch-ownership-inventory/REPO_GIT_HISTORY_INVENTORY.md`

Validation:

- `git status --short --branch`
- `git log --oneline main..HEAD`
- `git branch --all --verbose --no-abbrev`
- `node dist/cli/src/index.js resume --root . --json`
- `git diff --check`

### C002 - Define Feat Branch Ownership Strategy For The Existing Local Stack

Status: `done`

Classify queues as own-branch, stacked-on-continuation-branch, or historical-migration, then propose non-destructive branch ownership dispositions.

Stop before branch creation, branch pointer movement, cherry-pick, rebase, reset, push, or PR mutation.

Artifacts:

- `changes/M118-repo-branch-pr-governance/C002-define-feat-branch-ownership-strategy/SELECTED_CHANGE.yaml`
- `changes/M118-repo-branch-pr-governance/C002-define-feat-branch-ownership-strategy/ATOM_TASKS.yaml`
- `changes/M118-repo-branch-pr-governance/C002-define-feat-branch-ownership-strategy/IMPLEMENTATION_BRIEF.md`
- `changes/M118-repo-branch-pr-governance/C002-define-feat-branch-ownership-strategy/BRANCH_OWNERSHIP_STRATEGY.md`

### C003 - Generate Local PR-Ready Summaries For Reviewable Feat Queues

Status: `done`

Generate local-only `PR_READY_SUMMARY.md` artifacts for completed queues with enough commit and validation evidence, and mark older queues with missing evidence as not ready.

Artifacts:

- `changes/M118-repo-branch-pr-governance/C003-generate-local-pr-ready-summaries/SELECTED_CHANGE.yaml`
- `changes/M118-repo-branch-pr-governance/C003-generate-local-pr-ready-summaries/ATOM_TASKS.yaml`
- `changes/M118-repo-branch-pr-governance/C003-generate-local-pr-ready-summaries/IMPLEMENTATION_BRIEF.md`
- `changes/M118-repo-branch-pr-governance/C003-generate-local-pr-ready-summaries/LOCAL_PR_READY_SUMMARY_MATRIX.md`

### C004 - Produce Remote Push And Local-To-Remote PR Execution Plan

Status: `done`

Create an ordered remote operation plan that names branch, target base, local PR summary, commit evidence, remote-readiness blockers, rollback notes, and approval boundary for each proposed push or draft PR.

Risk: high. Remote mutation remains blocked until explicit operation-level approval.

Artifacts:

- `changes/M118-repo-branch-pr-governance/C004-produce-remote-push-and-pr-execution-plan/SELECTED_CHANGE.yaml`
- `changes/M118-repo-branch-pr-governance/C004-produce-remote-push-and-pr-execution-plan/ATOM_TASKS.yaml`
- `changes/M118-repo-branch-pr-governance/C004-produce-remote-push-and-pr-execution-plan/IMPLEMENTATION_BRIEF.md`
- `changes/M118-repo-branch-pr-governance/C004-produce-remote-push-and-pr-execution-plan/REMOTE_PUBLICATION_PLAN.md`

## Deferred Features

- `M119-approved-remote-pr-publication`: actual approved remote branch push and draft PR execution.
- `M120-historical-branch-repair`: any cherry-pick, rebase, reset, or historical branch repair.
