# Candidate Changes: M126 PR #6 M71 Readiness Governance

Source of truth: `CANDIDATE_CHANGES.yaml`.

## Scope

M126 owns PR #6 ready-for-review governance only.

- PR: `https://github.com/tiic-tech/openworkflow/pull/6`
- Head: `codex/m71-git-version-governance`
- Base: `main`
- Branch boundary: `codex/m126-m71-ready-review-governance`

Out of scope: merge, PR edit/close/comment/retarget, Issue mutation, push,
force-push, rebase, reset, branch deletion, branch surgery, unrelated branch
publication, or product source changes.

## Current State

- PR #6 state: `OPEN`
- PR #6 draft: `true`
- Head OID: `a0ddcf94b0f856a92218ef07fd323d3eb5bae0a1`
- Base OID: `d0e13f4bba3a847b763d2db3f771659aac3a4fe5`
- Mergeability: `MERGEABLE`
- Status checks: `[]`
- Remote head branch exists and matches the PR head OID.

## Next Recommended Candidate

`C001 - Refresh PR #6 readiness preflight`

C001 is read-only and must run before any high-risk decision packet or remote
ready-for-review mutation.

## Candidates

### C001 - Refresh PR #6 readiness preflight

Status: ready

Risk: medium

Outcome: record current read-only PR #6 readiness facts.

### C002 - Prepare PR #6 ready-for-review decision packet

Status: candidate

Risk: high

Outcome: prepare an evidence-only decision packet with exact approval text for
`gh pr ready 6`.

### C003 - Execute approved PR #6 ready-for-review transition

Status: candidate

Risk: high

Outcome: after exact approval, run only the approved PR #6 ready command.

### C004 - Record PR #6 readiness governance audit and handoff

Status: candidate

Risk: medium

Outcome: close M126 with local audit evidence.

## Stop Gates

- Do not mark PR #6 ready without exact approval.
- Do not merge, edit, close, comment on, or retarget PR #6.
- Do not mutate Issues.
- Do not push, force-push, rebase, reset, delete branches, or perform branch
  surgery.
