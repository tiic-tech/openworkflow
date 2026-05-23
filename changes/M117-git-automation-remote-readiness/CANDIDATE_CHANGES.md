# M117 Git Automation Remote Readiness Candidate Changes

Source of truth: `CANDIDATE_CHANGES.yaml`

Status: active

Branch boundary: `codex/m117-git-automation-remote-readiness`

Completed candidate: C001.

Completed candidate: C002.

Next recommended target: C003 high-risk decision before selection.

High-risk decision report:
`HIGH_RISK_DECISION_REPORT.md`

Decision status: approved Option D on 2026-05-23.

Recommended option: Option D, approve C003 then C004 as local/read-only
hardening only. This does not authorize push, PR mutation, Issue mutation,
merge, rebase, reset, force-push, or working-tree conflict resolution.

Selected candidate: C003.

## Scope

This queue prepares `git-automation` for future full remote management without
turning on push or merge. The decision boundary is: local automation remains
the implemented mutation surface today, while remote readiness must become
machine-readable enough for a later approved queue to publish branches, open or
update PRs, wait for checks, handle conflicts, merge, and record rollback
evidence in the correct order.

In scope:

- local commit evidence consumption for PR summaries and remote plans
- branch identity propagation across git-automation modes
- draft PR pilot approval and local audit evidence
- structured merge-conflict readiness checkpoints
- non-mutating remote-readiness verifier coverage

Out of scope:

- autonomous push
- `gh pr merge`
- `git merge`, `git rebase`, `git reset`, or force-push
- ready-for-review PR mutation
- GitHub Issue mutation

## Review Findings

- F001: draft PR write mode exists but lacks hard high-risk approval and local
  operation evidence.
- F002: merge conflict handling is prose-only and lacks structured checkpoint
  data.
- F003: branch identity governance is not yet applied to branch, remote-plan,
  simulate, or draft-pr modes.
- F004: PR-ready summary, remote-plan, and simulate miss
  `LOCAL_COMMIT_EVIDENCE.yaml` records and still rely on legacy `commit:`
  strings.

## Candidates

### C001 - Normalize Git-Automation Local Evidence Readers

Status: done

Risk: medium

Purpose: make PR-ready summary, remote-plan, and simulator consume the same
selected-change `LOCAL_COMMIT_EVIDENCE.yaml` records that strict queues now
require.

Depends on: none.

Acceptance focus:

- PR-ready summary reports commits and validation evidence from
  `LOCAL_COMMIT_EVIDENCE.yaml`.
- Remote-plan and simulator expose modern selected-change evidence records.
- Legacy `commit:` evidence remains supported.
- No remote mutation is enabled.

Selection artifacts:

- `C001-normalize-git-automation-local-evidence-readers/SELECTED_CHANGE.yaml`
- `C001-normalize-git-automation-local-evidence-readers/ATOM_TASKS.yaml`
- `C001-normalize-git-automation-local-evidence-readers/IMPLEMENTATION_BRIEF.md`

Completion: shared local evidence reader added and wired into PR-ready summary,
remote-plan, and simulator. Targeted RED/GREEN fixture is now part of runtime
surface verification.

### C002 - Apply Branch Identity Governance Across Git-Automation Modes

Status: done

Risk: medium

Purpose: extend M114 C008 branch identity protection beyond commit and resume
so stale continuation branches cannot pass remote readiness checks.

Depends on: C001.

Acceptance focus:

- Every queue-bound git-automation mode reports whether the branch owns the
  plan.
- Stale branch identities fail closed unless a scoped exception applies.
- Existing C008 commit behavior remains green.

Selection artifacts:

- `C002-apply-branch-identity-governance-across-git-automation-modes/SELECTED_CHANGE.yaml`
- `C002-apply-branch-identity-governance-across-git-automation-modes/ATOM_TASKS.yaml`
- `C002-apply-branch-identity-governance-across-git-automation-modes/IMPLEMENTATION_BRIEF.md`

Completion: branch, remote-plan, simulate, and draft-pr now report and enforce
feat-scoped branch identity. Stale branch identity fails closed unless a scoped
temporary continuation exception applies.

### C003 - Harden Draft PR Pilot Approval And Local Audit Evidence

Status: done

Risk: high

Purpose: make draft PR create/edit match gh-operation governance before future
remote PR automation relies on it.

Depends on: C001, C002.

Acceptance focus:

- `--write --allow-draft-pr` is insufficient without explicit local approval
  evidence.
- Successful draft PR mutation writes local audit evidence.
- Missing approval fails closed.
- Preview mode remains read-only.

Selection artifacts:

- `C003-harden-draft-pr-pilot-approval-and-local-audit-evidence/SELECTED_CHANGE.yaml`
- `C003-harden-draft-pr-pilot-approval-and-local-audit-evidence/ATOM_TASKS.yaml`
- `C003-harden-draft-pr-pilot-approval-and-local-audit-evidence/IMPLEMENTATION_BRIEF.md`

Completion: draft PR pilot write mode now requires `--approval-evidence` in
addition to `--write --allow-draft-pr`, reports operation kind/outcome in JSON,
and writes local draft PR operation audit evidence for approved write-mode paths.
Runtime-surface coverage uses fake `gh` and did not execute real PR create or
edit.

### C004 - Define Structured Merge-Conflict Readiness Checkpoint

Status: candidate

Risk: high

Purpose: replace prose-only merge conflict guidance with a machine-readable
checkpoint for future autonomous git execution.

Depends on: C001, C002.

Acceptance focus:

- Remote readiness reports include structured conflict checkpoint data.
- Conflict cases stop with conflict files and required next evidence.
- Clean cases distinguish fast-forward, clean non-fast-forward, and unknown
  states.
- No merge, rebase, reset, force-push, or PR merge is executed.

### C005 - Add Full Remote-Readiness Story Verifier

Status: candidate

Risk: medium

Purpose: prove the complete non-mutating remote-readiness path end to end.

Depends on: C001, C002, C003, C004.

Acceptance focus:

- Verifier demonstrates the future handoff order without real remote mutation.
- Verifier fails if commit evidence, branch identity, draft PR approval, or
  conflict checkpoint fields disappear.
- The later autonomous queue has concrete evidence to consume.
