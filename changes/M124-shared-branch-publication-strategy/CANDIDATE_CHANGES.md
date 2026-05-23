# Candidate Changes: M124 Shared Branch Publication Strategy

Source of truth: `CANDIDATE_CHANGES.yaml`.

## Scope

M124 owns the strategy and approval-gated publication workflow for the shared
M101-derived branch group:

- Target branch: `codex/m101-build-proto-prompt-command-split`
- Target base: `main`
- Target remote: `origin`
- Source queues: M105, M106, and M115

Out of scope: PR #4 or PR #6 ready-for-review transitions, merge, PR edit/close,
Issue mutation, unrelated branch publication, branch split execution,
cherry-pick, rebase, reset, force-push, remote branch deletion, or product
source changes.

Proposed branch boundary for this queue:
`codex/m124-shared-branch-publication-strategy`.

## Current State

- Current worktree branch during queue creation:
  `codex/m122-m71-historical-stack-publication`.
- M122 publication evidence is currently uncommitted; M124 writes only under
  `changes/M124-shared-branch-publication-strategy/`.
- Local shared M101 branch exists at
  `f8bf087211316506f48155859f3e18edbc7224e4`.
- `origin/main` is `d0e13f4bba3a847b763d2db3f771659aac3a4fe5`.
- M101 shared branch is 251 commits ahead of `origin/main`.
- `origin/main` is an ancestor of the shared M101 branch.
- Conflict probe produced tree `e70f5ae555b03b1ee3f1a3f32f94a0e8c94b55c9`.
- Remote branch `origin/codex/m101-build-proto-prompt-command-split` now exists
  at `f8bf087211316506f48155859f3e18edbc7224e4`.
- Draft PR #7 exists for head `codex/m101-build-proto-prompt-command-split`:
  `https://github.com/tiic-tech/openworkflow/pull/7`.
- M105, M106, and M115 all have branch-local PR-ready summaries and all record
  branch boundary `codex/m101-build-proto-prompt-command-split`.

## Outcome

M124 is complete.

C001 completed the read-only shared-branch inventory. C002 completed the
evidence-only high-risk decision report and recommends shared-stack publication
as the least-destructive path. C003 pushed the shared M101 branch to origin.
C004 created draft PR #7 and left it in draft state. C006 recorded final local
audit and handoff evidence.

## Candidates

### C001 - Refresh shared M101 branch publication inventory

Status: done

Risk: medium

Outcome: produce current read-only readiness facts for the shared M101 branch
group and recommend whether C002 can prepare the decision packet.

Completion evidence:

- `changes/M124-shared-branch-publication-strategy/C001-refresh-shared-m101-publication-inventory/PUBLICATION_INVENTORY.md`

### C002 - Prepare shared-stack versus split decision report

Status: done

Risk: high

Outcome: prepare an evidence-only decision packet comparing one shared
historical review branch against a split/surgery plan.

Completion evidence:

- `changes/M124-shared-branch-publication-strategy/HIGH_RISK_DECISION_REPORT.md`
- `changes/M124-shared-branch-publication-strategy/C002-shared-stack-versus-split-decision-report/SELECTED_CHANGE.yaml`
- `changes/M124-shared-branch-publication-strategy/C002-shared-stack-versus-split-decision-report/ATOM_TASKS.yaml`
- `changes/M124-shared-branch-publication-strategy/C002-shared-stack-versus-split-decision-report/IMPLEMENTATION_BRIEF.md`

### C003 - Execute approved shared M101 branch push

Status: done

Risk: high

Outcome: after exact approval, push only the shared M101 branch and record local
audit evidence.

Completion evidence:

- `changes/M124-shared-branch-publication-strategy/C003-approved-shared-m101-branch-push/PUSH_EVIDENCE.md`
- `changes/M124-shared-branch-publication-strategy/C003-approved-shared-m101-branch-push/SELECTED_CHANGE.yaml`
- `changes/M124-shared-branch-publication-strategy/C003-approved-shared-m101-branch-push/ATOM_TASKS.yaml`
- `changes/M124-shared-branch-publication-strategy/C003-approved-shared-m101-branch-push/IMPLEMENTATION_BRIEF.md`

### C004 - Create approved shared M101 draft PR

Status: done

Risk: high

Outcome: after exact approval, create one draft PR from the shared M101 branch
into `main`.

Completion evidence:

- `changes/M124-shared-branch-publication-strategy/C004-draft-pr-approval-packet/PR_BODY.md`
- `changes/M124-shared-branch-publication-strategy/C004-draft-pr-approval-packet/DRAFT_PR_APPROVAL_PACKET.md`
- `changes/M124-shared-branch-publication-strategy/C004-draft-pr-approval-packet/PR_EVIDENCE.md`
- `changes/M124-shared-branch-publication-strategy/C004-draft-pr-approval-packet/SELECTED_CHANGE.yaml`
- `changes/M124-shared-branch-publication-strategy/C004-draft-pr-approval-packet/ATOM_TASKS.yaml`
- `changes/M124-shared-branch-publication-strategy/C004-draft-pr-approval-packet/IMPLEMENTATION_BRIEF.md`

### C005 - Prepare approved branch split or surgery plan

Status: deferred

Risk: high

Outcome: if shared-stack publication is rejected, prepare a design-only split
or surgery plan without executing git history operations.

### C006 - Record M124 publication strategy audit and handoff

Status: done

Risk: medium

Outcome: close M124 with local audit evidence and explicit next governance
queues.

Completion evidence:

- `changes/M124-shared-branch-publication-strategy/C006-audit-handoff/M124_PUBLICATION_AUDIT.md`
- `changes/M124-shared-branch-publication-strategy/C006-audit-handoff/SELECTED_CHANGE.yaml`
- `changes/M124-shared-branch-publication-strategy/C006-audit-handoff/ATOM_TASKS.yaml`
- `changes/M124-shared-branch-publication-strategy/C006-audit-handoff/IMPLEMENTATION_BRIEF.md`

## Stop Gates

- Do not push the shared M101 branch without exact approval.
- Do not create a draft PR without exact approval.
- Do not mark any PR ready for review.
- Do not merge, close, edit, or retarget any PR.
- Do not mutate Issues.
- Do not cherry-pick, rebase, reset, force-push, delete branches, move branch
  pointers, or split history without a separate high-risk approval.
