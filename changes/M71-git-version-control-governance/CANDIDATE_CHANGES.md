# Candidate Changes - M71 Git Version Control Governance

Source of truth: `CANDIDATE_CHANGES.yaml`. This Markdown file is a readable
view only.

## Policy Summary

- Feat boundary: this queue owns git version control governance.
- Branch boundary: `codex/m71-git-version-governance`.
- Commit boundary: one selected candidate should complete as one coherent commit.
- PR boundary: one PR should summarize the feat branch, not individual atom
  tasks.
- Issue boundary: Issues are intent/problem sources; local OW artifacts own
  decomposition and audit linkage.
- gh boundary: read-only and evidence-writing operations may be governed
  separately from high-risk remote mutations.
- Next recommended candidate: `G016`.

## G001 - Formalize Git Governance Hierarchy In Planning Contracts

Status: `done`

Risk: `low`

Purpose: define the canonical relationship between atom tasks, selected changes,
commits, candidate queues, feats, branches, PRs, and merge boundaries.

Owned paths:

- `references/planning-artifact-contracts.md`
- `references/git-version-control-governance.md`
- `changes/M71-git-version-control-governance/G001-git-governance-contract/`

Validation:

- `npm run validate`
- `git diff --check`

Selection: `G001-git-governance-contract`

Completion evidence:

- `references/planning-artifact-contracts.md`
- `references/git-version-control-governance.md`
- `changes/M71-git-version-control-governance/G001-git-governance-contract/SELECTED_CHANGE.yaml`
- `changes/M71-git-version-control-governance/G001-git-governance-contract/ATOM_TASKS.yaml`

## G002 - Add Branch Boundary Fields To Decompose-To-Changes Outputs

Status: `done`

Risk: `medium`

Purpose: teach decompose-to-changes to record branch ownership when it creates
a new feat queue.

Dependencies: `G001`

Owned paths:

- `skills/decompose-to-changes/SKILL.md`
- `skills/decompose-to-changes/references/decomposition-protocol.md`
- `changes/M71-git-version-control-governance/G002-dtc-branch-boundary-fields/`

Validation:

- `python3 /Users/archy/.codex/skills/.system/skill-creator/scripts/quick_validate.py skills/decompose-to-changes`
- `npm run validate`
- `git diff --check`

Selection: `G002-dtc-branch-boundary-fields`

Completion evidence:

- `skills/decompose-to-changes/SKILL.md`
- `skills/decompose-to-changes/references/decomposition-protocol.md`
- `changes/M71-git-version-control-governance/G002-dtc-branch-boundary-fields/SELECTED_CHANGE.yaml`
- `changes/M71-git-version-control-governance/G002-dtc-branch-boundary-fields/ATOM_TASKS.yaml`

## G003 - Add Branch And Dirty-Tree Guards To Select-Change

Status: `done`

Risk: `medium`

Purpose: teach select-change to verify branch and working tree state before
selecting a candidate.

Dependencies: `G001`

Owned paths:

- `skills/select-change/SKILL.md`
- `skills/select-change/references/selection-protocol.md`
- `changes/M71-git-version-control-governance/G003-select-branch-dirty-guards/`

Validation:

- `python3 /Users/archy/.codex/skills/.system/skill-creator/scripts/quick_validate.py skills/select-change`
- `npm run validate`
- `git diff --check`

Selection: `G003-select-branch-dirty-guards`

Completion evidence:

- `skills/select-change/SKILL.md`
- `skills/select-change/references/selection-protocol.md`
- `changes/M71-git-version-control-governance/G003-select-branch-dirty-guards/SELECTED_CHANGE.yaml`
- `changes/M71-git-version-control-governance/G003-select-branch-dirty-guards/ATOM_TASKS.yaml`

## G004 - Validate Git Governance Fields And Completion Evidence

Status: `done`

Risk: `medium`

Purpose: extend repository validation for git governance fields and completion
commit evidence.

Dependencies: `G001`, `G002`, `G003`

Owned paths:

- `packages/core/src/validators/validateRepositoryContracts.ts`
- `packages/cli/src/dev/verifyRuntimeSurface.ts`
- `changes/M71-git-version-control-governance/G004-git-governance-validation/`

Validation:

- `npm run validate`
- `git diff --check`
- `npm run verify:runtime-surface`

Selection: `G004-git-governance-validation`

Completion evidence:

- `packages/core/src/validators/validateRepositoryContracts.ts`
- `packages/cli/src/dev/verifyRuntimeSurface.ts`
- `changes/M71-git-version-control-governance/G004-git-governance-validation/SELECTED_CHANGE.yaml`
- `changes/M71-git-version-control-governance/G004-git-governance-validation/ATOM_TASKS.yaml`

## G005 - Define Feat Completion And PR-Ready Summary Artifact

Status: `done`

Risk: `low`

Purpose: create a lightweight artifact contract for completing a candidate
queue as a feat branch and preparing a PR summary without opening a PR
automatically.

Dependencies: `G001`

Owned paths:

- `references/planning-artifact-contracts.md`
- `references/git-version-control-governance.md`
- `changes/M71-git-version-control-governance/G005-pr-ready-summary-contract/`

Validation:

- `npm run validate`
- `git diff --check`

Selection: `G005-pr-ready-summary-contract`

Completion evidence:

- `references/planning-artifact-contracts.md`
- `references/git-version-control-governance.md`
- `changes/M71-git-version-control-governance/G005-pr-ready-summary-contract/SELECTED_CHANGE.yaml`
- `changes/M71-git-version-control-governance/G005-pr-ready-summary-contract/ATOM_TASKS.yaml`

## G006 - Add Dogfood Fixtures For Branch-Per-Feat Workflow

Status: `done`

Risk: `medium`

Purpose: add focused fixtures and examples for a clean feat branch, selected
change commit, completion evidence, and PR-ready summary flow.

Dependencies: `G002`, `G003`, `G004`, `G005`

Owned paths:

- `packages/cli/src/dev/verifyRuntimeSurface.ts`
- `changes/M71-git-version-control-governance/G006-branch-per-feat-dogfood-fixtures/`

Validation:

- `npm run validate`
- `git diff --check`
- `npm run verify:runtime-surface`

Selection: `G006-branch-per-feat-dogfood-fixtures`

Completion evidence:

- `packages/cli/src/dev/verifyRuntimeSurface.ts`
- `changes/M71-git-version-control-governance/G006-branch-per-feat-dogfood-fixtures/BRANCH_PER_FEAT_FIXTURE.md`
- `changes/M71-git-version-control-governance/G006-branch-per-feat-dogfood-fixtures/EXAMPLE_PR_READY_SUMMARY.md`
- `changes/M71-git-version-control-governance/G006-branch-per-feat-dogfood-fixtures/SELECTED_CHANGE.yaml`
- `changes/M71-git-version-control-governance/G006-branch-per-feat-dogfood-fixtures/ATOM_TASKS.yaml`

## G007 - Decide Whether OW Should Automate Git And Gh Mutation Operations

Status: `done`

Risk: `high`

Purpose: produce a high-risk decision packet before any future move from
planning guidance into automated local git or authenticated GitHub mutations.

Dependencies: `G001`, `G005`, `G009`

Owned paths:

- `changes/M71-git-version-control-governance/HIGH_RISK_DECISION_REPORT.md`
- `changes/M71-git-version-control-governance/G007-git-automation-high-risk-decision/`

Validation:

- `npm run validate`
- `git diff --check`

Stop condition: do not select or implement automated git or gh mutation behavior
without explicit approval of a concrete high-risk decision option.

High-risk report:

- `changes/M71-git-version-control-governance/HIGH_RISK_DECISION_REPORT.md`

Decision: approved Option B plus narrowed local automation. Remote push, remote
PR creation, Issue mutation, and merge still require explicit approval.

## G011 - Formalize Approved Local Git Automation Command Contract

Status: `done`

Risk: `medium`

Purpose: define the command-level contract for future `ow:git-automation`, with
a strict split between approved local automation and separately approved remote
mutation.

Dependencies: `G007`

Owned paths:

- `references/git-version-control-governance.md`
- `references/gh-operation-governance.md`
- `references/planning-artifact-contracts.md`
- `changes/M71-git-version-control-governance/G011-local-git-automation-contract/`

Validation:

- `npm run validate`
- `git diff --check`

Selection: `G011-local-git-automation-contract`

Completion evidence:

- `references/git-version-control-governance.md`
- `references/gh-operation-governance.md`
- `references/planning-artifact-contracts.md`
- `changes/M71-git-version-control-governance/G011-local-git-automation-contract/SELECTED_CHANGE.yaml`
- `changes/M71-git-version-control-governance/G011-local-git-automation-contract/ATOM_TASKS.yaml`

## G012 - Implement Local Feat Branch Creation For Candidate Queues

Status: `done`

Risk: `medium`

Purpose: add local-only automation that creates or checks out the branch
recorded by a queue's `queue_policy.branch_boundary` when starting a new feat.

Dependencies: `G011`

Owned paths:

- `packages/core/src/`
- `packages/cli/src/`
- `changes/M71-git-version-control-governance/G012-local-feat-branch-automation/`

Validation:

- `npm run validate`
- `git diff --check`
- `npm run verify:runtime-surface`

Selection: `G012-local-feat-branch-automation`

Completion evidence:

- `packages/core/src/git/localGitAutomation.ts`
- `packages/cli/src/dev/verifyRuntimeSurface.ts`
- `changes/M71-git-version-control-governance/G012-local-feat-branch-automation/LOCAL_BRANCH_AUTOMATION_EVIDENCE.yaml`
- `changes/M71-git-version-control-governance/G012-local-feat-branch-automation/SELECTED_CHANGE.yaml`
- `changes/M71-git-version-control-governance/G012-local-feat-branch-automation/ATOM_TASKS.yaml`

## G013 - Implement Selected-Change Local Commit Automation

Status: `done`

Risk: `medium`

Purpose: add local-only automation that commits at least one completed selected
change after validation evidence is present.

Dependencies: `G011`, `G012`

Owned paths:

- `packages/core/src/`
- `packages/cli/src/`
- `changes/M71-git-version-control-governance/G013-selected-change-commit-automation/`

Validation:

- `npm run validate`
- `git diff --check`
- `npm run verify:runtime-surface`

Selection: `G013-selected-change-commit-automation`

Completion evidence:

- `packages/core/src/git/localGitAutomation.ts`
- `packages/cli/src/dev/verifyRuntimeSurface.ts`
- `references/git-version-control-governance.md`
- `changes/M71-git-version-control-governance/G013-selected-change-commit-automation/LOCAL_COMMIT_EVIDENCE.yaml`
- `changes/M71-git-version-control-governance/G013-selected-change-commit-automation/SELECTED_CHANGE.yaml`
- `changes/M71-git-version-control-governance/G013-selected-change-commit-automation/ATOM_TASKS.yaml`
- `commit: fb003d7346ce027e08a9f149718caadf82755ad6`

## G014 - Implement Local PR-Ready Summary Generation For Completed Queues

Status: `done`

Risk: `medium`

Purpose: add local-only automation that creates `PR_READY_SUMMARY.md` for a
fully implemented and validated `CANDIDATE_CHANGES` queue.

Dependencies: `G011`, `G013`

Owned paths:

- `packages/core/src/`
- `packages/cli/src/`
- `changes/M71-git-version-control-governance/G014-pr-ready-summary-generation/`

Validation:

- `npm run validate`
- `git diff --check`
- `npm run verify:runtime-surface`

Selection: `G014-pr-ready-summary-generation`

Completion evidence:

- `packages/core/src/git/prReadySummary.ts`
- `packages/cli/src/dev/verifyRuntimeSurface.ts`
- `changes/M71-git-version-control-governance/PR_READY_SUMMARY.md`
- `changes/M71-git-version-control-governance/G014-pr-ready-summary-generation/LOCAL_COMMIT_EVIDENCE.yaml`
- `changes/M71-git-version-control-governance/G014-pr-ready-summary-generation/SELECTED_CHANGE.yaml`
- `changes/M71-git-version-control-governance/G014-pr-ready-summary-generation/ATOM_TASKS.yaml`
- `commit: c8d48b1dc387f40d1aae27193155e5fc3847f912`

## G015 - Add Ow:Git-Automation Command Shell With Remote Approval Gates

Status: `done`

Risk: `high`

Purpose: introduce the command surface for approved local git automation while
requiring explicit user approval before push, remote PR creation, Issue
mutation, or merge.

Dependencies: `G011`, `G012`, `G013`, `G014`

Owned paths:

- `packages/core/src/commands/registry.ts`
- `packages/adapters/codex/src/`
- `packages/cli/src/`
- `skills/`
- `references/git-automation-governance.md`
- `changes/M71-git-version-control-governance/G015-ow-git-automation-command-shell/`

Validation:

- `npm run validate`
- `git diff --check`
- `npm run verify:runtime-surface`

Selection: `G015-ow-git-automation-command-shell`

Completion evidence:

- `packages/cli/src/commands/gitAutomation.ts`
- `packages/cli/src/index.ts`
- `packages/cli/src/dev/verifyRuntimeSurface.ts`
- `packages/core/src/commands/registry.ts`
- `packages/core/src/onboarding/agentsGuide.ts`
- `references/git-automation-governance.md`
- `.agents/skills/ow-git-automation/SKILL.md`
- `.agents/openworkflow-adapter.yaml`
- `.openworkflow/audit/COMMAND_AUDIT_INDEX.yaml`
- `.openworkflow/audit/CONTEXT_PACKETS.yaml`
- `changes/M71-git-version-control-governance/G015-ow-git-automation-command-shell/SELECTED_CHANGE.yaml`
- `changes/M71-git-version-control-governance/G015-ow-git-automation-command-shell/ATOM_TASKS.yaml`

## G016 - Define Autonomous Git Automation Lifecycle

Status: `ready`

Risk: `high`

Purpose: plan the fully autonomous git automation mode that can push, create or
update PRs, handle merge readiness, and merge without per-step approval after
explicit configuration and safety policy are accepted.

Dependencies: `G015`

Owned paths:

- `references/git-automation-governance.md`
- `changes/M71-git-version-control-governance/G016-autonomous-git-automation-lifecycle/`

Validation:

- `npm run validate`
- `git diff --check`

## G008 - Formalize Issue Governance And Source-Of-Truth Rules

Status: `done`

Risk: `low`

Purpose: define how OW relates external Issues to local planning queues,
including when local issue artifacts are git-tracked and when GitHub Issues
remain the remote source of truth.

Dependencies: `G001`

Owned paths:

- `references/planning-artifact-contracts.md`
- `references/git-version-control-governance.md`
- `references/issue-governance.md`
- `changes/M71-git-version-control-governance/G008-issue-governance-source-of-truth/`

Validation:

- `npm run validate`
- `git diff --check`

Selection: `G008-issue-governance-source-of-truth`

Completion evidence:

- `references/planning-artifact-contracts.md`
- `references/git-version-control-governance.md`
- `references/issue-governance.md`
- `changes/M71-git-version-control-governance/G008-issue-governance-source-of-truth/SELECTED_CHANGE.yaml`
- `changes/M71-git-version-control-governance/G008-issue-governance-source-of-truth/ATOM_TASKS.yaml`

## G009 - Define Gh Issue And PR Operation Risk Boundaries

Status: `done`

Risk: `medium`

Purpose: classify gh operations as read-only, evidence-writing, or high-risk
mutation before any GitHub integration is implemented.

Dependencies: `G001`, `G008`

Owned paths:

- `references/git-version-control-governance.md`
- `references/issue-governance.md`
- `references/gh-operation-governance.md`
- `changes/M71-git-version-control-governance/G009-gh-operation-risk-boundaries/`

Validation:

- `npm run validate`
- `git diff --check`

Selection: `G009-gh-operation-risk-boundaries`

Completion evidence:

- `references/git-version-control-governance.md`
- `references/issue-governance.md`
- `references/gh-operation-governance.md`
- `changes/M71-git-version-control-governance/G009-gh-operation-risk-boundaries/SELECTED_CHANGE.yaml`
- `changes/M71-git-version-control-governance/G009-gh-operation-risk-boundaries/ATOM_TASKS.yaml`

## G010 - Create Analyze-Changes Skill For Cross-Queue Priority Analysis

Status: `done`

Risk: `medium`

Purpose: add a read-only planning skill that compares multiple active
`CANDIDATE_CHANGES` queues and recommends the next `plan_id` and `candidate_id`
without selecting or implementing it.

Dependencies: `G001`, `G008`

Owned paths:

- `skills/analyze-changes/SKILL.md`
- `skills/analyze-changes/references/analysis-protocol.md`
- `references/planning-artifact-contracts.md`
- `changes/M71-git-version-control-governance/G010-analyze-changes-skill/`

Validation:

- `python3 /Users/archy/.codex/skills/.system/skill-creator/scripts/quick_validate.py skills/analyze-changes`
- `npm run validate`
- `git diff --check`

Selection: `G010-analyze-changes-skill`

Completion evidence:

- `skills/analyze-changes/SKILL.md`
- `skills/analyze-changes/references/analysis-protocol.md`
- `references/planning-artifact-contracts.md`
- `changes/M71-git-version-control-governance/G010-analyze-changes-skill/SELECTED_CHANGE.yaml`
- `changes/M71-git-version-control-governance/G010-analyze-changes-skill/ATOM_TASKS.yaml`
