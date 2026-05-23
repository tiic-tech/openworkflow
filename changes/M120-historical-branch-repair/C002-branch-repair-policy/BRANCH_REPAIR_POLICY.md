# M120 Branch Repair Policy

## Purpose

This policy converts the C001 inventory into repair categories for historical OpenWorkflow branch
and PR-ready evidence governance. It does not execute branch repair, publish branches, mutate PRs,
or approve destructive git operations.

## Categories

### Already Published Pilot

Applies to M102.

Criteria:

- The branch has already been pushed to `origin`.
- A draft PR exists and is still open.
- The branch-local `PR_READY_SUMMARY.md` exists on the branch.

Policy:

- Do not change branch ownership inside M120.
- Keep PR #4 draft until a separate ready-for-review decision is approved.
- Any PR edit, close, ready-for-review transition, merge, or rollback requires separate exact
  approval.

### Low-Risk Evidence Repair

Applies to M117 based on the C001 inventory.

Criteria:

- The queue has an independent local branch boundary.
- The branch boundary owns the plan id.
- The branch has no remote publication PR yet.
- The missing item is branch-local evidence, such as `PR_READY_SUMMARY.md`.
- Repair can be done by regenerating or restoring local evidence without changing commit history.

Policy:

- C003 may restore branch-local PR-ready evidence for these candidates.
- No remote mutation is allowed during evidence repair.
- After repair, remote readiness must be checked again before any push or PR approval request.
- Current first target: `M117-git-automation-remote-readiness`.

### Intentional Historical Stack

Applies to M71 if accepted after review.

Criteria:

- The branch has a coherent historical topic even if it contains many commits.
- The PR-ready summary exists on the branch.
- The branch is old enough that strict commit evidence may be incomplete.
- Splitting the branch would cost more review integrity than it gains.

Policy:

- M71 may remain a coupled review branch if C005 records it as intentionally stacked.
- It should not be silently treated as a clean modern queue.
- Publication still requires fresh remote-plan evidence and explicit push/PR approval.

### Shared Branch Boundary Requiring Repair Decision

Applies to M105, M106, and M115 based on C001.

Criteria:

- Multiple queues record the same branch boundary.
- Their PR-ready summaries are not present on that branch.
- Publishing each queue independently would require either accepting a shared review stack or
  creating new branch/evidence boundaries.

Policy:

- Do not publish these queues as independent PRs from the shared branch without an explicit decision.
- C005 may recommend one shared-stack review branch only if the review story is coherent.
- Creating independent branches from the shared stack requires a high-risk report if it involves
  cherry-pick, rebase, reset, or branch pointer surgery.

## Low-Risk Repair Allowed In C003

C003 may perform local evidence repair when all of these are true:

- The target branch already exists locally.
- The target branch boundary owns the queue plan id.
- The working tree is clean except for scoped evidence files.
- The repair writes local planning/review evidence only.
- No commit history, branch pointer, remote ref, PR state, Issue state, or generated surface changes.

Examples:

- Regenerate `PR_READY_SUMMARY.md` on the owning local branch with `git-automation summary`.
- Record branch-local evidence blockers when regeneration is not sufficient.

## High-Risk Stop Boundaries

The following operations are not approved by M120 C002 and require a
`HIGH_RISK_DECISION_REPORT.md` plus exact operation-level user approval:

- `git rebase`
- `git reset`
- `git cherry-pick` sequences intended to create or split review branches
- `git branch -D` or destructive branch deletion
- `git push`, including first push, force-push, or remote branch deletion
- `gh pr create`, `gh pr edit`, `gh pr close`, ready-for-review transitions, and merge
- Issue, label, milestone, or assignment mutation

## Next Candidate Guidance

Proceed to C003 first for low-risk M117 evidence repair. C004 should be used only if the inventory
and policy show that branch surgery is actually needed.

C005 should run after C003 to produce a repaired publication order and decide whether M117 is ready
for a future approval-gated M121 publication queue.
