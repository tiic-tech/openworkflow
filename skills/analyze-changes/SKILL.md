---
name: analyze-changes
description: Analyze one or more OpenWorkflow CANDIDATE_CHANGES queues and recommend the next plan id and candidate id without selecting or implementing it. Use when multiple candidate queues exist, when cross-queue priority is unclear, when branch or dirty-tree constraints may affect what to do next, or before select-change should consume a cross-queue recommendation.
---

# Analyze Changes

## Purpose

Compare candidate queues and produce a read-only priority analysis. This skill
does not decompose new queues, does not select a candidate, and does not
implement code.

## Read First

Read only what is needed:

- `references/planning-artifact-contracts.md`
- `references/git-version-control-governance.md`
- `references/issue-governance.md` when Issues affect priority
- `skills/analyze-changes/references/analysis-protocol.md`
- The target `CANDIDATE_CHANGES.yaml` files

## Workflow

1. Run `git status --short --branch` and record the current branch and dirty
   tree state.
2. Discover candidate queues only from user-provided paths or obvious
   `changes/*/CANDIDATE_CHANGES.yaml` files when the user asks for a global
   analysis.
3. Read YAML as the source of truth. Use Markdown views only as readable aids.
4. For each queue, record branch boundary, next recommended candidate, ready
   candidates, blocked candidates, high-risk candidates, and dependency gaps.
5. Score candidates with the queue policy first, then cross-queue signals:
   readiness, dependency unlock value, risk, branch fit, dirty-tree fit,
   Issue linkage, validation realism, and user recency.
6. If the best next candidate is `risk: high`, stop with a high-risk analysis
   recommendation and point to the needed `HIGH_RISK_DECISION_REPORT.md`.
7. Write `CHANGE_ANALYSIS.yaml` first, then `CHANGE_ANALYSIS.md` as a readable
   view.
8. Recommend exactly one `target_plan_id` and `target_candidate_id` when the
   evidence supports it. Otherwise recommend the queue maintenance needed before
   selection.
9. Hand off to `select-change`; do not create `SELECTED_CHANGE.yaml`,
   `ATOM_TASKS.yaml`, or `IMPLEMENTATION_BRIEF.md`.

## Output Location

Default to an analysis folder when comparing multiple queues:

```text
changes/<analysis-id>/
  CHANGE_ANALYSIS.yaml
  CHANGE_ANALYSIS.md
```

When analyzing one owning feat queue only, the analysis may live under that
queue folder if it is clearly scoped to that queue:

```text
changes/<plan_id>/CHANGE_ANALYSIS.yaml
changes/<plan_id>/CHANGE_ANALYSIS.md
```

Use an `analysis-id` that describes the decision episode, not a selected
candidate.

## Recommendation Rules

- Prefer ready candidates over blocked or candidate-status entries.
- Prefer a queue's `next_recommended_candidate_id` when it is ready and its
  dependencies still hold.
- Prefer candidates that unlock multiple downstream changes.
- Prefer candidates whose branch boundary matches the current branch.
- Treat unrelated dirty-tree work as a reason to pause or recommend committing
  the current selected change first.
- Do not recommend a high-risk candidate for selection unless the user has
  explicitly approved a concrete option from a high-risk decision report.
- If multiple queues are active and none is clearly superior, recommend the
  smallest queue maintenance step that will make selection safe.

## Boundaries

- Do not create or modify candidate queues except to add an explicit analysis
  evidence link when the user requests that maintenance.
- Do not select candidates.
- Do not implement candidates.
- Do not run destructive git operations.
- Do not run gh mutation operations.
- Do not treat local Issue snapshots as authoritative when GitHub Issues are
  configured as the source of truth.
