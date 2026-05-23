# M120 Historical Branch Repair

Source of truth: `CANDIDATE_CHANGES.yaml`.

## Boundary

M120 owns historical local branch and PR-ready evidence repair after the M102 remote publication pilot.

Proposed branch boundary: `codex/m120-historical-branch-repair`

Current branch: `codex/m120-historical-branch-repair`

DTC did not create or switch branches during queue creation. A later git-automation branch action created the local boundary branch before C001 selection.

## Selection Policy

Select C001 first. M120 must produce a read-only branch ownership inventory before local branch repair, PR-ready summary restoration, or high-risk history operations.

High-risk operations such as rebase, reset, force-push, remote deletion, PR edit, merge, or ready-for-review transition require a dedicated high-risk report and exact operation-level approval.

Next recommended candidate: none; M120 is complete.

## Candidates

### C001 - Inventory historical branch ownership and PR-ready evidence

Status: done

Risk: medium

Purpose: build a read-only baseline mapping local branches, remote branches, queue branch boundaries, PR-ready summaries, existing PRs, and blockers.

Excludes: branch creation, checkout-based repair, cherry-pick, rebase, reset, force-push, remote mutation, PR mutation, and Issue mutation.

Completion evidence:

- `changes/M120-historical-branch-repair/C001-inventory-historical-branch-ownership/INVENTORY.md`

Result: M102 and M71 have branch-local PR-ready summaries; M117 is missing its branch-local summary; M105, M106, and M115 share the M101 branch boundary and need policy before repair.

Unlocks: C002, C003, C004

### C002 - Decide historical branch repair policy and stop boundaries

Status: done

Risk: medium

Purpose: define when stacked branches are acceptable, when branch-local evidence repair is enough, and when high-risk history surgery needs a stop gate.

Depends on: C001

Unlocks: C003, C004, C005

Completion evidence:

- `changes/M120-historical-branch-repair/C002-branch-repair-policy/BRANCH_REPAIR_POLICY.md`

Result: M117 is the next low-risk evidence repair target. M71 may remain an intentional historical stack after review. M105, M106, and M115 need shared-branch policy before publication. History surgery remains blocked behind C004 high-risk reporting and exact approval.

### C003 - Restore branch-local PR-ready evidence for low-risk candidates

Status: done

Risk: medium

Purpose: for candidates that do not require history rewriting, ensure the owning local branch contains the matching `PR_READY_SUMMARY.md` and enough queue evidence for future remote-plan checks.

Depends on: C001, C002

Excludes: publishing branches, creating PRs, rewriting history, and repairing high-risk branches.

Selected target: M117 branch-local `PR_READY_SUMMARY.md` restoration.

Completion evidence:

- `changes/M120-historical-branch-repair/C003-restore-branch-local-pr-ready-evidence/M117_EVIDENCE_REPAIR.md`

Result: M117 branch-local summary was restored and committed on `codex/m117-git-automation-remote-readiness` at `898f0152`. Remote-plan no longer reports a missing summary; `simulator evidence is missing` remains.

Unlocks: C005

### C004 - Prepare high-risk decision report for history surgery if needed

Status: deferred

Risk: high

Purpose: if branch pointer changes are required, create the high-risk report that names options, risks, exact unapproved commands, rollback limits, and approval text.

Approval required: yes, before any history surgery command.

Depends on: C001, C002

Excludes: executing cherry-pick, rebase, reset, force-push, branch deletion, remote mutation, or selecting a surgery option.

Unlocks: C005

Deferred reason: current M120 work did not require history surgery. Restore C004 only if a concrete rebase, reset, cherry-pick split, destructive delete, force-push, or PR mutation is needed.

### C005 - Produce repaired publication order and remote readiness plan

Status: done

Risk: medium

Purpose: turn repaired branch inventory into a publication order that separates ready candidates, candidates needing fresh summaries, and candidates needing high-risk repair.

Depends on: C001, C002, C003

Unlocks: M121-m117-remote-publication

Completion evidence:

- `changes/M120-historical-branch-repair/C005-repaired-publication-order/PUBLICATION_ORDER.md`

Result: M120 recommends `M121-m117-remote-publication` as the next approval-gated queue. M117 ranks first; M71 ranks second after explicit historical-stack acceptance; M101-derived queues remain deferred.

## Deferred

M121 should own any approval-gated M117 push or draft PR. PR #4 ready-for-review remains separate and requires exact approval after branch-stack review.
