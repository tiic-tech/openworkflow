# Candidate Changes: M123 PR Ready Review Governance

Source of truth: `CANDIDATE_CHANGES.yaml`.

## Scope

M123 owns ready-for-review governance for existing draft PRs only:

- PR #5: `https://github.com/tiic-tech/openworkflow/pull/5`
- PR #4: `https://github.com/tiic-tech/openworkflow/pull/4`

Out of scope: merge, PR body/title edit, PR close, Issue mutation, M71
publication, shared M101-derived branch strategy, force-push, remote branch
deletion, rebase, reset, or product source changes.

Branch boundary for this queue: `codex/m123-pr-ready-review-governance`.

## Current State

- PR #5 is open, draft, mergeable, and points from
  `codex/m117-git-automation-remote-readiness` at
  `898f0152a4e3e026ee5dcc78d4ef585c722a37b7` into `main`.
- PR #4 is open, draft, mergeable, and points from
  `codex/m102-selected-change-commit-gate` at
  `bd2780b1d5b117b2734e5b732164e5d299bd521a` into `main`.
- Both remote branch heads match their PR head OIDs.
- Both queried PRs have empty status check rollups.
- Ready-for-review commands remain unapproved:

```bash
gh pr ready 5 --repo tiic-tech/openworkflow
gh pr ready 4 --repo tiic-tech/openworkflow
```

## High-Risk Report

- `changes/M123-pr-ready-review-governance/HIGH_RISK_DECISION_REPORT.md`

The report is evidence, not approval.

## Candidates

### C001 - Refresh draft PR readiness preflight

Status: done

Risk: medium

Outcome: produce current read-only readiness facts for PR #5 and PR #4 and
recommend the first ready-for-review target.

Selection: `C001-draft-pr-readiness-preflight`

Completion evidence:

- `changes/M123-pr-ready-review-governance/C001-draft-pr-readiness-preflight/READINESS_PREFLIGHT.md`
- `gh pr view 5 --repo tiic-tech/openworkflow`
- `gh pr view 4 --repo tiic-tech/openworkflow`
- `git ls-remote --heads origin codex/m117-git-automation-remote-readiness codex/m102-selected-change-commit-gate`

### C002 - Prepare exact PR #5 ready-for-review decision

Status: ready

Risk: high

Outcome: convert C001 facts into an exact high-risk approval packet for
`gh pr ready 5 --repo tiic-tech/openworkflow`.

### C003 - Execute approved PR #5 ready-for-review transition

Status: candidate

Risk: high

Outcome: after exact approval, mark only PR #5 ready for review and record local
audit evidence.

### C004 - Prepare PR #4 ready-for-review decision

Status: ready

Risk: high

Outcome: decide whether PR #4 should be handled after PR #5 in this queue or
deferred to M102-specific readiness governance.

### C005 - Record PR readiness governance audit and handoff

Status: ready

Risk: medium

Outcome: close M123 with local audit evidence and name remaining publication
governance queues.

## Stop Gates

- Do not mark PR #5 ready without exact approval.
- Do not mark PR #4 ready without exact approval.
- Do not merge, close, or edit any PR.
- Do not mutate Issues.
- Do not push, force-push, rebase, reset, or delete branches.
- Do not publish M71 or shared M101-derived branches from this queue.
