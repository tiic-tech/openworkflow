# M105 M104 Direct Trust-Gate Fixes Candidate Changes

Source of truth: `CANDIDATE_CHANGES.yaml`

Status: complete

Branch boundary: `codex/m101-build-proto-prompt-command-split`

## Scope

This queue recovers the direct defects exposed by the M104 smart city copilot
fourth-round E2E test. It is intentionally narrower than the broader Agent
interview roadmap.

In scope:

- summary writer output shape versus validate expectations
- current vision pointer reporting after registration
- commit evidence backfill in git automation
- earlier owned-path reconciliation for pointer and summary outputs

Out of scope:

- `resume --json`
- full artifact lineage graph
- full prompt2proto strategy engine
- provider-backed image benchmark
- proto2html
- remote git or PR mutation

## Selection Policy

Selected candidate: none.

C001 is first because M104 directly proved that `summarize --write` can create
a `SUMMARY.yaml` file that `validate --json` then rejects. This is a small,
self-contained trust-gate contradiction.

## Candidates

### C001 - Align summarize output shape with validate expectations

Status: done

Risk: medium

Purpose: make deterministic summary files written by `summarize --write`
compatible with validation expectations.

Acceptance:

- Summary files include validation-compatible contract keys.
- `validate` no longer rejects summary files produced by `summarize --write`.
- Regression coverage proves the M104 failure mode.
- Source-artifact validation remains strict.

Selection artifacts:

- `changes/M105-m104-direct-trust-gate-fixes/C001-align-summarize-output-shape/SELECTED_CHANGE.yaml`
- `changes/M105-m104-direct-trust-gate-fixes/C001-align-summarize-output-shape/ATOM_TASKS.yaml`
- `changes/M105-m104-direct-trust-gate-fixes/C001-align-summarize-output-shape/IMPLEMENTATION_BRIEF.md`

Completion:

- Summary writer now emits `contract_type: workflow` and `status: current`.
- Runtime-surface verification asserts the generated summary header.
- Local commit evidence: `changes/M105-m104-direct-trust-gate-fixes/C001-align-summarize-output-shape/LOCAL_COMMIT_EVIDENCE.yaml`

### C002 - Fix current vision pointer reporting after vision session registration

Status: done

Risk: medium

Purpose: stop handoff/current-state from showing `current_vision: null` after a
current vision session has been registered and summaries trust it.

Depends on: C001.

Selection artifacts:

- `changes/M105-m104-direct-trust-gate-fixes/C002-fix-current-vision-pointer-reporting/SELECTED_CHANGE.yaml`
- `changes/M105-m104-direct-trust-gate-fixes/C002-fix-current-vision-pointer-reporting/ATOM_TASKS.yaml`
- `changes/M105-m104-direct-trust-gate-fixes/C002-fix-current-vision-pointer-reporting/IMPLEMENTATION_BRIEF.md`

Completion:

- `packages/cli/src/commands/brief.ts`
- `packages/cli/src/commands/check.ts`
- `packages/cli/src/dev/verifyRuntimeSurface.ts`
- `changes/M105-m104-direct-trust-gate-fixes/C002-fix-current-vision-pointer-reporting/LOCAL_COMMIT_EVIDENCE.yaml`

### C003 - Auto-backfill commit evidence into selected-change completion

Status: done

Risk: high

Purpose: make `git-automation commit --commit-evidence` close the evidence
loop by writing and linking `LOCAL_COMMIT_EVIDENCE.yaml` when safe.

Depends on: C001.

High-risk decision:

- Approved option: Option A - Narrow Safe Backfill
- Decision report: `changes/M105-m104-direct-trust-gate-fixes/HIGH_RISK_DECISION_REPORT.md`

Selection artifacts:

- `changes/M105-m104-direct-trust-gate-fixes/C003-auto-backfill-commit-evidence/SELECTED_CHANGE.yaml`
- `changes/M105-m104-direct-trust-gate-fixes/C003-auto-backfill-commit-evidence/ATOM_TASKS.yaml`
- `changes/M105-m104-direct-trust-gate-fixes/C003-auto-backfill-commit-evidence/IMPLEMENTATION_BRIEF.md`

Completion:

- `changes/M105-m104-direct-trust-gate-fixes/HIGH_RISK_DECISION_REPORT.md`
- `packages/core/src/git/localGitAutomation.ts`
- `packages/cli/src/commands/gitAutomation.ts`
- `packages/cli/src/dev/verifyRuntimeSurface.ts`

### C004 - Reconcile selected-change owned paths with command pointer and summary outputs

Status: done

Risk: medium

Purpose: give earlier guidance when a selected change omits expected pointer,
index, or summary outputs from owned paths.

Depends on: C001.

Selection artifacts:

- `changes/M105-m104-direct-trust-gate-fixes/C004-reconcile-owned-path-output-guidance/SELECTED_CHANGE.yaml`
- `changes/M105-m104-direct-trust-gate-fixes/C004-reconcile-owned-path-output-guidance/ATOM_TASKS.yaml`
- `changes/M105-m104-direct-trust-gate-fixes/C004-reconcile-owned-path-output-guidance/IMPLEMENTATION_BRIEF.md`

Completion:

- `packages/core/src/git/localGitAutomation.ts`
- `packages/cli/src/dev/verifyRuntimeSurface.ts`

## Deferred

- Agent resume cockpit: `M106-agent-resume-cockpit`
- Artifact lineage graph: `M107-artifact-lineage-graph`
- Consistency-first split-later prompt2proto strategy:
  `M108-consistency-first-prompt2proto-strategy`
- Provider and fallback generation mode metadata:
  `M109-provider-fallback-generation-metadata`
