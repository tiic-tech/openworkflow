---
name: analyze-changes
description: Analyze multiple OpenWorkflow CANDIDATE_CHANGES queues and recommend the next plan id and candidate id without selecting or implementing it. Use when multiple candidate queues exist, when cross-queue priority is unclear, or before select-change should consume a cross-queue recommendation.
---

# Analyze Changes

## Purpose

Compare multiple candidate queues and produce a read-only priority analysis. This skill
does not decompose new queues, does not select a candidate, and does not
implement code.

Do not use this skill as a mandatory pre-step for a single active queue. When
the current work state has one owning `CANDIDATE_CHANGES.yaml`, use
`select-change` directly; SC owns single-queue prioritization and selection.

## Read First

Read only what is needed:

- `references/planning-artifact-contracts.md`
- `references/git-version-control-governance.md`
- `references/issue-governance.md` when Issues affect priority
- `skills/analyze-changes/references/analysis-protocol.md`
- The target `CANDIDATE_CHANGES.yaml` files, plural

## Workflow

1. Run `git status --short --branch` and record the current branch and dirty
   tree state.
2. Confirm the request is a cross-queue decision. If there is only one active
   queue and no explicit cross-queue comparison request, stop and hand off to
   `select-change` without writing `CHANGE_ANALYSIS.yaml`.
3. Discover candidate queues only from user-provided paths or obvious
   `changes/*/CANDIDATE_CHANGES.yaml` files when the user asks for a global
   analysis.
4. Read YAML as the source of truth. Use Markdown views only as readable aids.
5. For each queue, record branch boundary, next recommended candidate, ready
   candidates, blocked candidates, high-risk candidates, and dependency gaps.
6. Score candidates with the queue policy first, then cross-queue signals:
   readiness, dependency unlock value, risk, branch fit, dirty-tree fit,
   Issue linkage, validation realism, and user recency.
7. If the best next candidate is `risk: high`, stop with a high-risk analysis
   recommendation and point to the needed `HIGH_RISK_DECISION_REPORT.md`.
8. Write `CHANGE_ANALYSIS.yaml` first, then `CHANGE_ANALYSIS.md` as a readable
   view.
9. Recommend exactly one `target_plan_id` and `target_candidate_id` when the
   evidence supports it. Otherwise recommend the queue maintenance needed before
   selection.
10. Hand off to `select-change`; do not create `SELECTED_CHANGE.yaml`,
   `ATOM_TASKS.yaml`, or `IMPLEMENTATION_BRIEF.md`.

## Output Location

Default to an analysis folder when comparing multiple queues:

```text
changes/<analysis-id>/
  CHANGE_ANALYSIS.yaml
  CHANGE_ANALYSIS.md
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
- Do not produce a same-queue priority analysis when `select-change` can rank
  candidates inside the only active queue.
- Do not run destructive git operations.
- Do not run gh mutation operations.
- Do not treat local Issue snapshots as authoritative when GitHub Issues are
  configured as the source of truth.
