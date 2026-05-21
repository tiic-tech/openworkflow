# Candidate Changes - M71 Git Version Control Governance

Source of truth: `CANDIDATE_CHANGES.yaml`. This Markdown file is a readable
view only.

## Policy Summary

- Feat boundary: this queue owns git version control governance.
- Branch boundary: `codex/m71-git-version-governance`.
- Commit boundary: one selected candidate should complete as one coherent commit.
- PR boundary: one PR should summarize the feat branch, not individual atom
  tasks.
- Next recommended candidate: `G001`.

## G001 - Formalize Git Governance Hierarchy In Planning Contracts

Status: `ready`

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

## G002 - Add Branch Boundary Fields To Decompose-To-Changes Outputs

Status: `candidate`

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

Status: `candidate`

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

Status: `candidate`

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

## G007 - Decide Whether OW Should Automate Branch, Commit, Push, And PR Operations

Status: `candidate`

Risk: `high`

Purpose: produce a high-risk decision packet before any future move from
planning guidance into automated git mutations.

Dependencies: `G001`, `G005`

Owned paths:

- `changes/M71-git-version-control-governance/HIGH_RISK_DECISION_REPORT.md`
- `changes/M71-git-version-control-governance/G007-git-automation-high-risk-decision/`

Validation:

- `npm run validate`
- `git diff --check`

Stop condition: do not select or implement automated git mutation behavior
without explicit approval of a concrete high-risk decision option.
