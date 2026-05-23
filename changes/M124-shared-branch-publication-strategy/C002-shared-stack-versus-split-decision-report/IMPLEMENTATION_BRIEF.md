# C002 - Shared-Stack Versus Split Decision Report

## Goal

Prepare the local high-risk decision report for publishing the shared
M101-derived branch group. This candidate is evidence-only and does not approve
or execute any remote or destructive operation.

## Approved Boundary

Approved user text:

`Approve M124 C002 decision report: prepare shared-stack versus split high-risk decision report; do not push, create PR, or perform branch surgery.`

Allowed:

- Create `HIGH_RISK_DECISION_REPORT.md`.
- Update M124 queue and summary state.
- Record exact later approval gates.

Forbidden:

- Push.
- Draft PR creation.
- Ready-for-review transition.
- Cherry-pick, rebase, reset, force-push, branch deletion, branch pointer moves,
  or split history.
- PR edit, PR close, Issue mutation, merge.

## Read First

- `changes/M124-shared-branch-publication-strategy/CANDIDATE_CHANGES.yaml`
- `changes/M124-shared-branch-publication-strategy/C001-refresh-shared-m101-publication-inventory/PUBLICATION_INVENTORY.md`
- `changes/M105-m104-direct-trust-gate-fixes/PR_READY_SUMMARY.md`
- `changes/M106-agent-resume-cockpit/PR_READY_SUMMARY.md`
- `changes/M115-internal-coder-quality-governance/PR_READY_SUMMARY.md`
- `references/git-version-control-governance.md`
- `references/gh-operation-governance.md`

## Decision Direction

The report recommends shared-stack publication as the preferred next path
because it is lower risk than history surgery: the branch is cleanly based on
`origin/main`, remote branch and PR are absent, and the three source queues
already share the same branch boundary. This recommendation is not approval.

## Validation

- `node dist/cli/src/index.js validate --root . --json`
- `git diff --check`
- YAML parse for M124 queue, summary, and C002 planning artifacts

## Stop Conditions

- Stop before any push.
- Stop before any PR creation or PR mutation.
- Stop before any branch surgery or destructive git operation.
- Stop if target remote branch or target PR state changes before C003.
