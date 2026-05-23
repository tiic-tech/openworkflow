# Candidate Changes: M122 M71 Historical Stack Publication

Source of truth: `CANDIDATE_CHANGES.yaml`.

## Scope

M122 owns approval-gated publication of the existing M71 branch as one historical
stack review branch:

- Target branch: `codex/m71-git-version-governance`
- Target base: `main`
- Target remote: `origin`

Out of scope: merge, PR ready-for-review transition, PR edit/close, Issue
mutation, shared M101-derived branch publication, force-push, remote branch
deletion, rebase, reset, cherry-pick, branch splitting, or product source
changes.

Branch boundary for this queue: `codex/m122-m71-historical-stack-publication`.

## Current State

- Local M71 branch exists at `a0ddcf94b0f856a92218ef07fd323d3eb5bae0a1`.
- `origin/main` is `d0e13f4bba3a847b763d2db3f771659aac3a4fe5`.
- M71 is 66 commits ahead of `origin/main`.
- `origin/main` is an ancestor of M71.
- Conflict probe produced tree `bbf7b9e12650cd3d984f7fa379e8ecd3871bf5e3`.
- Remote branch `origin/codex/m71-git-version-governance` is absent.
- No PR exists for head `codex/m71-git-version-governance`.
- `changes/M71-git-version-control-governance/PR_READY_SUMMARY.md` exists.

## Candidates

### C001 - Refresh M71 remote publication preflight

Status: ready

Risk: medium

Outcome: produce current read-only readiness facts for M71 and recommend whether
to proceed to a high-risk push decision.

### C002 - Prepare M71 push decision and isolated execution preflight

Status: candidate

Risk: high

Outcome: prepare the exact push decision packet. This is evidence, not approval.

### C003 - Execute approved M71 branch push

Status: candidate

Risk: high

Outcome: after exact approval, push only the M71 branch and record local audit
evidence.

### C004 - Create approved M71 draft PR

Status: candidate

Risk: high

Outcome: after exact approval, create one draft PR from M71 into `main`.

### C005 - Record M71 publication audit and handoff

Status: candidate

Risk: medium

Outcome: close M122 with local audit evidence and handoff remaining publication
governance.

## Stop Gates

- Do not push M71 without exact approval.
- Do not create a draft PR for M71 without exact approval.
- Do not mark any PR ready for review.
- Do not merge, close, edit, or retarget any PR.
- Do not mutate Issues.
- Do not push, force-push, rebase, reset, cherry-pick, split branches, or delete
  branches outside the exact approved operation.
