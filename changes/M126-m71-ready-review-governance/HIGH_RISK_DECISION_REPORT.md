# M126 High-Risk Decision Report

Captured at: `2026-05-24T06:30:00+08:00`

## Scope

This report is local planning evidence for PR #6 ready-for-review governance.

- PR: `https://github.com/tiic-tech/openworkflow/pull/6`
- PR number: `6`
- Head: `codex/m71-git-version-governance`
- Base: `main`

It is evidence, not approval. It does not authorize `gh pr ready`, merge, PR
edit, PR close, Issue mutation, push, force-push, rebase, reset, branch
deletion, branch surgery, or product source changes.

## Current Facts

- State: `OPEN`
- Draft: `true`
- Title: `M71: Git version control governance`
- Head OID: `a0ddcf94b0f856a92218ef07fd323d3eb5bae0a1`
- Base OID: `d0e13f4bba3a847b763d2db3f771659aac3a4fe5`
- Mergeable: `MERGEABLE`
- Review decision: ``
- Status check rollup: `[]`
- Remote head branch matches PR head: yes

## Decision Options

### Option A - Mark PR #6 Ready For Review

Run the exact approved ready-for-review command for PR #6.

Rationale:

- PR #6 is open, draft, mergeable, and has a stable remote head.
- M122 explicitly deferred PR #6 to a later ready-for-review governance lane.
- M126 C001 found no current remote readiness blocker.

Risks:

- The operation mutates GitHub collaboration state.
- PR #6 is an older historical branch and should not be merged by this queue.
- Empty status checks mean there is no remote CI signal to rely on at this gate.

Guardrails:

- Run only `gh pr ready 6 --repo tiic-tech/openworkflow` after exact approval.
- Do not merge PR #6.
- Do not edit, close, retarget, request review, or comment on PR #6.
- Do not mutate Issues.
- Do not push, force-push, rebase, reset, delete branches, or perform branch
  surgery.

### Option B - Defer PR #6 Readiness

Leave PR #6 in draft and close M126 with a deferral audit.

Rationale:

- This avoids any remote mutation.
- It gives room for additional review of the historical M71 branch before
  exposing it as ready.

Risks:

- PR #6 remains blocked in draft.
- Mainline governance remains less converged.

## Recommendation

Prefer Option A if the user wants to continue current git governance toward
mainline convergence. PR #6 is technically ready for the ready-for-review
transition based on current metadata, but this report is not approval.

## Exact Approval For C003

Suggested approval text:

`Approve M126 C003 ready PR #6: run gh pr ready 6 --repo tiic-tech/openworkflow`

## Stop Criteria

- Stop if PR #6 is no longer draft before C003.
- Stop if PR #6 head OID changes before C003.
- Stop if PR #6 becomes non-mergeable before C003.
- Stop before `gh pr ready` without exact approval.
- Stop before merge, PR edit/close/comment/retarget, review request, Issue
  mutation, push, force-push, rebase, reset, branch deletion, or branch surgery.
