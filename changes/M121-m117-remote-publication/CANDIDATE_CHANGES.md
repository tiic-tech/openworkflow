# Candidate Changes: M121 M117 Remote Publication

Source of truth: `CANDIDATE_CHANGES.yaml`.

## Scope

M121 owns the approval-gated publication workflow for the existing M117 branch:
`codex/m117-git-automation-remote-readiness` into `main` on `origin`.

The M121 governance branch is proposed as `codex/m121-m117-remote-publication`,
but no branch was created during DTC queue creation. The publication target is
the existing M117 feat branch, not the M121 governance branch.

Out of scope: M71 publication, PR #4 ready-for-review, M101 shared branch group
splitting, rebase, reset, force-push, branch deletion, merge, Issue mutation, or
product source changes.

## Selection Policy

Select C001 first. C002, C003, and C004 are high-risk remote publication
boundaries. A high-risk report and exact operation-level user approval are
required before any push or PR mutation.

Next recommended candidate: C002, gated by high-risk report and exact operation approval.

## Observed State

- Current branch during queue creation: `codex/m120-historical-branch-repair`
- Latest local commit: `8a3d807`
- Target branch: `codex/m117-git-automation-remote-readiness`
- Target base: `main`
- Target remote: `origin`
- M117 branch-local PR-ready summary: present
- M117 summary repair commit: `898f0152a4e3e026ee5dcc78d4ef585c722a37b7`
- M117 remote branch: absent
- M117 existing PRs: none
- Fresh remote-plan from the M120 branch is read-only but blocked by current
  branch mismatch and missing simulator evidence binding.
- Fresh simulator from the M120 branch is read-only but blocked by current
  branch mismatch.

## Candidates

### C001 - Refresh M117 publication preflight and choose execution model

Status: done

Risk: medium

Outcome: create a current read-only preflight packet and choose whether a later
approved push should run from a checked-out M117 branch, an isolated worktree, or
an exact refspec push from the governance branch.

Owned paths:

- `changes/M121-m117-remote-publication/`

Depends on: none

Unlocks: C002, C003, C004, C005

Completion evidence:

- `changes/M121-m117-remote-publication/C001-refresh-m117-publication-preflight/PUBLICATION_PREFLIGHT.md`

Result: M117 local branch head is `898f0152a4e3e026ee5dcc78d4ef585c722a37b7`,
`origin/main` is `d0e13f4bba3a847b763d2db3f771659aac3a4fe5`, remote branch is
absent, no PR exists, merge-tree is clean, and M117 is 263 commits ahead of
`origin/main`. The selected future execution model is an isolated M117 worktree.

### C002 - Prepare exact high-risk push decision report

Status: candidate

Risk: high

Outcome: create `HIGH_RISK_DECISION_REPORT.md` for exactly one M117 push
operation. The report is evidence, not approval.

High-risk report:

- `changes/M121-m117-remote-publication/HIGH_RISK_DECISION_REPORT.md`

Recommended option: run a narrow isolated-worktree preflight spike before asking
for exact push approval. The future push command remains unapproved:

```bash
git -C ../openworkflow-m117-publish push origin HEAD:refs/heads/codex/m117-git-automation-remote-readiness
```

Owned paths:

- `changes/M121-m117-remote-publication/HIGH_RISK_DECISION_REPORT.md`
- `changes/M121-m117-remote-publication/`

Depends on: C001

Unlocks: C003

### C003 - Execute approved M117 branch push and record remote evidence

Status: candidate

Risk: high

Outcome: after exact approval, push only
`codex/m117-git-automation-remote-readiness` to origin and record local audit
evidence.

Owned paths:

- `changes/M121-m117-remote-publication/`

Depends on: C002

Unlocks: C004, C005

### C004 - Create approved M117 draft PR

Status: candidate

Risk: high

Outcome: after separate exact approval, create one draft PR from M117 into
`main` and record local PR evidence.

Owned paths:

- `changes/M121-m117-remote-publication/`

Depends on: C003

Unlocks: C005

### C005 - Record M117 publication audit and next governance handoff

Status: candidate

Risk: medium

Outcome: close M121 with a local audit and name the next queue for M71, PR #4,
or the shared M101 branch group.

Owned paths:

- `changes/M121-m117-remote-publication/`

Depends on: C001

Unlocks: M122, M123, M124

## Stop Gates

- Do not push M117 without exact approval for the concrete command.
- Do not create a draft PR without separate exact approval.
- Do not mark any PR ready for review from M121.
- Do not merge.
- Do not mutate Issues.
- Do not publish M71 or shared M101-derived branches from this queue.
