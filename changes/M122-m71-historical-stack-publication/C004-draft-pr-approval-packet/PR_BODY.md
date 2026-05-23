# M71 Git Version Control Governance

This draft PR publishes the M71 branch for review. It was created from the M71
local PR-ready summary after M122 completed approval-gated branch publication.

## Governance Boundary

- Source queue: `changes/M71-git-version-control-governance/CANDIDATE_CHANGES.yaml`
- Publication queue: `changes/M122-m71-historical-stack-publication/CANDIDATE_CHANGES.yaml`
- Head branch: `codex/m71-git-version-governance`
- Base branch: `main`
- M71 branch HEAD: `a0ddcf94b0f856a92218ef07fd323d3eb5bae0a1`
- PR state: draft

This PR should remain draft until a separate ready-for-review approval exists.
It does not approve merge, Issue mutation, force-push, branch deletion, or
history rewrite.

## Completed M71 Changes

- `G001` Formalize git governance hierarchy in planning contracts
- `G002` Add branch boundary fields to decompose-to-changes outputs
- `G003` Add branch and dirty-tree guards to select-change
- `G004` Validate git governance fields and completion evidence
- `G005` Define feat completion and PR-ready summary artifact
- `G006` Add dogfood fixtures for branch-per-feat workflow
- `G007` Decide whether OW should automate git and gh mutation operations
- `G008` Formalize Issue governance and source-of-truth rules
- `G009` Define gh issue and PR operation risk boundaries
- `G010` Create analyze-changes skill for cross-queue priority analysis
- `G011` Formalize approved local git automation command contract
- `G012` Implement local feat branch creation for candidate queues
- `G013` Implement selected-change local commit automation
- `G014` Implement local PR-ready summary generation for completed queues
- `G015` Add ow:git-automation command shell with remote approval gates
- `G016` Define autonomous git automation lifecycle
- `G017` Build read-only autonomous git simulator
- `G018` Plan narrow autonomous remote pilot
- `G019` Implement remote read-only PR-ready planning
- `G020` Pilot draft PR remote mutation

## M122 Publication Audit

- M122 C001 refreshed read-only publication preflight for the M71 historical stack.
- M122 C002 recorded the high-risk push decision report and isolated worktree preflight.
- M122 C003 pushed only `codex/m71-git-version-governance` to origin after exact approval.
- M122 C004 prepared this draft PR body and approval packet; draft PR creation requires separate exact approval.

## Validation Recorded By M71

- `npm run validate`
- `git diff --check`
- `quick_validate.py skills/decompose-to-changes`
- `quick_validate.py skills/select-change`
- `npm run verify:runtime-surface`
- `quick_validate.py skills/analyze-changes`

## Review Notes

- The branch is a historical review branch and is 66 commits ahead of `origin/main`.
- M122 recorded no existing M71 PR before draft PR preparation.
- The remote M71 branch exists at `a0ddcf94b0f856a92218ef07fd323d3eb5bae0a1`.
- Draft PR creation is the only remote PR mutation covered by the C004 approval packet.
- Marking the PR ready for review, editing the PR after creation, merging, closing, or mutating Issues remain separate approval gates.
