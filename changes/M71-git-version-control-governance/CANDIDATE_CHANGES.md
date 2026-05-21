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
- Next recommended candidate: `G002`.

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

Status: `ready`

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

## G003 - Add Branch And Dirty-Tree Guards To Select-Change

Status: `ready`

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

## G004 - Validate Git Governance Fields And Completion Evidence

Status: `candidate`

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

## G005 - Define Feat Completion And PR-Ready Summary Artifact

Status: `ready`

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

## G006 - Add Dogfood Fixtures For Branch-Per-Feat Workflow

Status: `candidate`

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

## G007 - Decide Whether OW Should Automate Git And Gh Mutation Operations

Status: `candidate`

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

Status: `ready`

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
