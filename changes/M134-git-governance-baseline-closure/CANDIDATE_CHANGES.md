# M134 Git Governance Baseline Closure

Source of truth: `CANDIDATE_CHANGES.yaml`.

M134 starts from `origin/main` at `6612aa3e06996ad0151e3686d0c972677fc892c6`, the merge commit for PR #5. Its job is to finish the remaining OW git-governance baseline before normal code development resumes.

## Boundary

- Branch boundary: `codex/m134-git-governance-baseline-closure`
- Branch base: `origin/main`
- Current base commit: `6612aa3e06996ad0151e3686d0c972677fc892c6`
- Next recommended candidate: `C004`

In scope: post-merge git/PR inventory, extracting necessary M131/M132 git-governance deltas onto a fresh branch, PR #8 disposition planning, M134 publication planning, and final baseline handoff.

Out of scope: unrelated product features, blind historical branch merge, branch surgery, push, PR creation/edit/close/merge, Issue mutation, force-push, rebase, reset, or revert without exact approval.

## Current Remote State

Merged git governance PRs:

- PR #4: M102 selected-change commit gate
- PR #5: M117 git automation remote readiness governance
- PR #6: M71 git version control governance
- PR #7: M101 shared stack governance updates

Open PRs:

| PR | Branch | State | Draft | Scope |
| --- | --- | --- | --- | --- |
| #8 | `codex/m130-remaining-pr5-pr7-merge-governance` | OPEN | true | M130 draft audit, disposition needed |

Relevant local branches not ancestor of current `origin/main`:

- `codex/m130-remaining-pr5-pr7-merge-governance`
- `codex/m131-git-automation-selected-change-commit-gate-hotfix`
- `codex/m132-cc-branch-pr-lifecycle-gate`
- `codex/m133-remaining-pr5-merge-governance`

## Candidates

### C001 - Inventory remaining git governance baseline state

Status: done
Risk: medium

Selected change artifacts:

- `C001-inventory-remaining-git-governance-baseline-state/SELECTED_CHANGE.yaml`
- `C001-inventory-remaining-git-governance-baseline-state/ATOM_TASKS.yaml`
- `C001-inventory-remaining-git-governance-baseline-state/IMPLEMENTATION_BRIEF.md`
- `C001-inventory-remaining-git-governance-baseline-state/GIT_GOVERNANCE_BASELINE_INVENTORY.md`

Result:

- PR #8 is the only remaining open PR and needs a disposition decision.
- M131/M132 contain source behavior deltas not present on current `origin/main`.
- M130/M133 contain local audit evidence that may need explicit publication gates.
- Old stacked branches should not be merged, rebased, reset, or force-pushed as the baseline path.

Classify remaining local branches, open PRs, and unmerged governance work.

Acceptance:

- Remaining governance branches and open PRs are classified.
- The inventory states which work is still required for a formal code-development baseline.
- No remote mutation or branch surgery occurs.

### C002 - Extract M131 selected-change commit gate delta onto M134

Status: done
Risk: high

Reapply only the necessary M131 source behavior onto the fresh M134 branch.

Acceptance:

- A selected change with implementation files cannot pass strict handoff without local commit evidence.
- Git-automation commit evidence is linked to selected-change completion.
- Existing strict summary checks still pass.

Result:

- `git-automation commit` refuses completed implementation candidates in strict queues when `--commit-evidence` is omitted.
- Selected-change artifact inference supports list-shaped `selection.artifacts`.
- Required evidence backfill fails closed when queue or selected-change completion records cannot be updated.
- Runtime-surface verification covers the missing-evidence failure and successful backfill path.

### C003 - Extract M132 CC branch and PR lifecycle gate delta onto M134

Status: done
Risk: high

Reapply branch-per-CC and completed-CC PR lifecycle gates without importing old stacked history.

Acceptance:

- New CC queues require independent branch identity.
- Completed CC queues surface an explicit PR/publication gate before baseline-ready state.
- Generated surfaces are updated only through source/sync paths.

Result:

- `queue_policy.git_lifecycle_gate: strict` now requires a plan-owned branch boundary.
- Completed strict lifecycle queues require repo-relative `DRAFT_PR_OPERATION_EVIDENCE.yaml` before baseline-ready trust.
- `summaries --strict` and handoff quality include strict lifecycle blockers.
- Decompose-to-changes source guidance now instructs new queues to set strict lifecycle and branch boundary before selected work.

### C004 - Decide PR #8 disposition after PR #5 merge

Status: ready
Risk: high

Prepare a local decision packet for PR #8.

Acceptance:

- PR #8 disposition is explicit.
- Future PR #8 mutation has exact approval text and stop gates.
- No remote mutation occurs in C004.

### C005 - Prepare M134 baseline publication packet

Status: candidate
Risk: high

Prepare the push/draft-PR decision packet for M134.

Acceptance:

- M134 branch is locally PR-ready.
- Exact remote publication approval handle is recorded.
- No remote mutation occurs in C005.

### C006 - Execute approved M134 baseline publication

Status: candidate
Risk: high

Run only approved M134 push and draft PR creation if explicitly authorized.

Acceptance:

- Only the exact approved M134 branch push and draft PR creation occur.
- Publication evidence records command, result, PR URL, and forbidden operations not performed.
- No merge occurs.

### C007 - Execute approved PR #8 disposition if needed

Status: candidate
Risk: high

Run only the approved PR #8 cleanup action if C004 recommends one and the user approves it.

Acceptance:

- PR #8 final disposition matches exact user approval.
- No unrelated remote mutation occurs.

### C008 - Complete formal git governance baseline handoff

Status: candidate
Risk: medium

Record whether OW git governance is complete enough for formal code development.

Acceptance:

- The handoff states whether git governance is complete enough for formal code development.
- Any remaining remote operation is explicitly gated and not implied.
- No unauthorized operation is recorded.
