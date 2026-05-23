# M101 Shared Stack: M105/M106/M115 Governance Updates

## Summary

This draft PR publishes the shared M101-derived historical branch for review.
The branch intentionally contains three completed OpenWorkflow planning and
runtime governance queues that all recorded the same branch boundary:

- M105: M104 direct trust-gate and evidence fixes
- M106: Agent resume cockpit
- M115: Internal coder quality governance

The branch is published as one coupled review stack because the completed
queues share `codex/m101-build-proto-prompt-command-split`. Splitting the stack
would require higher-risk history surgery, so M124 chose the least-destructive
path: publish the existing branch as one draft PR with explicit shared-stack
review context.

## Branch And Base

- Head: `codex/m101-build-proto-prompt-command-split`
- Head OID: `f8bf087211316506f48155859f3e18edbc7224e4`
- Base: `main`
- Base OID at M124 preflight: `d0e13f4bba3a847b763d2db3f771659aac3a4fe5`
- Commits ahead of base at M124 preflight: `251`
- Conflict probe tree at M124 preflight: `e70f5ae555b03b1ee3f1a3f32f94a0e8c94b55c9`

## Source Queues

### M105 - M104 Direct Trust-Gate And Evidence Fixes

Completed changes:

- C001 Align summarize output shape with validate expectations
- C002 Fix current vision pointer reporting after vision session registration
- C003 Auto-backfill commit evidence into selected-change completion
- C004 Reconcile selected-change owned paths with command pointer and summary outputs

Local summary: `changes/M105-m104-direct-trust-gate-fixes/PR_READY_SUMMARY.md`

### M106 - Agent Resume Cockpit

Completed changes:

- C001 Define resume packet contract and command boundary
- C002 Implement base resume aggregator
- C003 Detect active planning queue and current work item
- C004 Classify actions and evidence for Agent handoff
- C005 Expose resume in runtime surface and documentation

Local summary: `changes/M106-agent-resume-cockpit/PR_READY_SUMMARY.md`

### M115 - Internal Coder Quality Governance

Completed changes:

- C001 Define internal coder protocol contract and command boundary
- C002 Migrate code-quality governor into OW source coder skill
- C003 Register internal `/ow:coder` command protocol
- C004 Wire coder governance into change and team protocols
- C005 Surface coder gate state in recovery and git governance
- C006 Introduce optional coder evidence artifact contract
- C007 Add coder continuous growth loop for reusable lessons

Local summary: `changes/M115-internal-coder-quality-governance/PR_READY_SUMMARY.md`

## M124 Publication Governance

M124 local evidence:

- `changes/M124-shared-branch-publication-strategy/HIGH_RISK_DECISION_REPORT.md`
- `changes/M124-shared-branch-publication-strategy/C003-approved-shared-m101-branch-push/PUSH_EVIDENCE.md`

Important boundaries:

- This PR should remain draft after creation.
- Ready-for-review transition requires a separate approval gate.
- Merge requires a separate approval gate.
- Do not treat this PR as three separate branch histories; it is a shared-stack review branch.

## Validation Evidence

The source queues recorded repeated local validation across the stack, including:

- `npm run build`
- `npm run verify:runtime-surface`
- `node dist/cli/src/index.js validate --root . --json`
- `node dist/cli/src/index.js summaries --root . --strict --json`
- `node dist/cli/src/index.js handoff --root . --json`
- `node dist/cli/src/index.js resume --root . --json`
- `git diff --check`

M124 publication preflight additionally verified:

- Remote branch exists at `f8bf087211316506f48155859f3e18edbc7224e4`
- No existing PR was found for head `codex/m101-build-proto-prompt-command-split`

## Review Notes

This is a draft PR for historical review. The main review question is whether
the shared stack should be accepted as one coupled branch, or whether follow-up
split/surgery planning is required before review can proceed.
