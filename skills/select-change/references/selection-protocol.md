# Selection Protocol

Use this reference when selecting one candidate from `CANDIDATE_CHANGES.yaml`
and preparing implementation artifacts.

## Selection Inputs

Required:

- `CANDIDATE_CHANGES.yaml`

Optional:

- `CANDIDATE_CHANGES.md` as a readable view
- `CHANGE_ANALYSIS.yaml` as read-only cross-queue recommendation evidence
- upstream source artifacts named by the queue
- user constraints such as "choose C004" or "avoid runtime changes"
- top-level queue `operations` for audit history
- current branch and dirty-tree state from `git status --short --branch`

If the user names a candidate id, verify that its dependencies are satisfied
before selecting it. If the id is blocked, not ready, or `risk: high`, report
why and stop unless the user explicitly approves the relevant risk or decision
option.

If the user provides multiple queues, first decide whether the request is a
read-only comparison or an actual selection. Read-only comparison belongs to
`analyze-changes`. Selection may consume a prior `CHANGE_ANALYSIS.yaml`, but it
must still write artifacts inside one target queue.

## Feat And Commit Cadence

The source `CANDIDATE_CHANGES.yaml` is the feature-level queue. Selection does
not normally create a new top-level `changes/<id>/` folder. Instead, place
candidate-specific planning artifacts inside the existing feat folder:

```text
changes/<plan_id>/
  CANDIDATE_CHANGES.yaml
  <candidate-id>-<slug>/
    SELECTED_CHANGE.yaml
    ATOM_TASKS.yaml
    IMPLEMENTATION_BRIEF.md
```

Each selected candidate should be small enough to complete as one coherent git
commit. When the candidate completes, update the queue with completion evidence
and include the commit id when available.

## Branch And Dirty-Tree Guards

Before selecting, compare current git state with the queue boundary:

- current branch from `git status --short --branch`
- dirty paths from `git status --short --branch`
- `queue_policy.branch_boundary` when present

If the current branch differs from `queue_policy.branch_boundary`, stop before
selection unless the user explicitly approves a planning-only exception or
asks to continue on the current branch. Report the recorded branch, current
branch, and exact resume condition. Do not run checkout or branch commands.

If the tree is dirty, decide whether the paths are part of the current
selection operation. A clean selection can create selection artifacts and update
the queue. A dirty tree containing previous selected-change implementation,
unrelated source edits, or generated surfaces should stop selection until that
work is committed, stashed, or otherwise resolved by the user. Do not perform
those git operations from this skill.

Selection artifacts should state the expected commit boundary: the selected
candidate should complete as one coherent commit unless it is split or
superseded before implementation continues.

## Cross-Queue Arbitration

The normal path is one active `CANDIDATE_CHANGES.yaml` queue. Cross-queue
arbitration is an explicit exception for moments when multiple active queues
compete for the next selected change.

Trigger cross-queue arbitration when:

- the user supplies multiple queue paths
- the user asks which active queue should go next
- a `CHANGE_ANALYSIS.yaml` recommends a target plan and candidate
- a legacy queue is being reactivated and must be compared against current work

Do not silently scan all `changes/*/CANDIDATE_CHANGES.yaml` files during a
single-queue selection. Broad discovery belongs to `analyze-changes` unless the
user explicitly asks select-change to consume that global context.

When consuming `CHANGE_ANALYSIS.yaml`:

1. Treat it as advisory evidence, not as permission to select.
2. Verify `recommendation.target_plan_id` and
   `recommendation.target_candidate_id` against the target queue.
3. Re-check status, dependencies, branch boundary, dirty tree, and high-risk
   gates from current files.
4. If the recommendation is stale, stop and name the queue maintenance or fresh
   analysis needed.
5. If the recommendation is still valid, create the selected-change folder
   inside `changes/<target_plan_id>/`.

Record cross-queue rejected alternatives in `SELECTED_CHANGE.yaml` with this
shape:

```yaml
rejected_alternatives:
  - plan_id: M68-post-proto-workflow-planning
    candidate_id: H003
    reason: High risk and missing a local high-risk decision report.
```

Use `id` only for alternatives from the same source queue when the surrounding
artifact already names the source plan. Use `plan_id` plus `candidate_id` for
cross-queue alternatives.

Create a meta-selection or analysis artifact only when the user's requested
output is the decision record itself. Do not use meta-selection artifacts as a
shortcut around selecting one implementable candidate in its owning queue.

## Targeted Candidate Review

For point-to-point review, inspect only the requested candidate plus the
dependencies, unlocks, operation history, and directly owned paths needed to
judge readiness.

Return:

- `candidate_id`
- `status`
- `readiness`: ready, not_ready, blocked, already_done, or superseded
- `dependency_status`
- `scope_risks`
- `validation_gaps`
- `high_risk_report`: required, missing, present, or not_applicable
- `recommended_operation`: query, select, update, split, defer, block,
  supersede, or none

This mode is read-first. It should not mutate the queue unless the user asks for
the recommended operation to be applied.

## Decision Order

1. Stop on branch mismatch unless an explicit planning-only exception exists.
2. Stop on unrelated dirty-tree work that would blur the commit boundary.
3. Exclude `done`, `blocked`, `deferred`, and `superseded` candidates.
4. Prefer `ready` candidates over plain `candidate` entries.
5. Honor a current `CHANGE_ANALYSIS.yaml` recommendation when it points to a
   ready, dependency-satisfied, non-high-risk candidate in the target queue.
6. Honor `next_recommended_candidate_id` when it is ready and coherent.
7. Prefer candidates that unlock other candidates.
8. Prefer focused owned paths over cross-module changes.
9. Prefer clear validation over unclear or manual-only acceptance.
10. Prefer lower-risk dogfood or source behavior before runtime exposure.
11. Stop on `risk: high` unless explicit user approval names a concrete decision
   option.

When two candidates are close, pick the one that produces better evidence for
the next planning decision.

## High-Risk Selection Gate

High-risk candidates require a decision report before selection. The report is
usually `changes/<plan_id>/HIGH_RISK_DECISION_REPORT.md` and is defined in
`references/planning-artifact-contracts.md`.

When the best next candidate is `risk: high`:

1. Check whether the queue links an existing high-risk decision report.
2. If a report exists, summarize its concrete risks, options, recommended path,
   guardrails, go criteria, and stop criteria.
3. If no report exists, stop and recommend a `decompose-to-changes` maintenance
   operation to create one.
4. Do not create selection artifacts unless the user explicitly approves a
   concrete option such as design-only, research-only, narrow spike, or full
   implementation.

Explicit approval must be more specific than "continue". It should identify the
approved option or replacement candidate. If approval is ambiguous, ask for the
decision option and do not select.

When a high-risk candidate is approved and selected:

- Include the approved option in `selection_reason`.
- Add the report path to rejected alternatives or evidence.
- Copy report guardrails into `IMPLEMENTATION_BRIEF.md` stop conditions.
- Keep atom tasks scoped to the approved option, not the full high-risk surface.

## SELECTED_CHANGE.yaml

Include:

- source plan id and source candidate id
- concise selection reasons
- rejected alternatives when the choice is not obvious; use `plan_id` and
  `candidate_id` for cross-queue alternatives
- includes and excludes copied from the selected candidate
- owned paths copied from the selected candidate
- forbidden paths inferred from the candidate exclusions and repo rules
- acceptance and validation copied from the selected candidate

Do not copy the entire candidate queue into this artifact.

## ATOM_TASKS.yaml

Break the selected change into tasks in this order:

1. `read`: inspect existing context only when needed
2. `edit` or `document`: make the core source/artifact change
3. `verify`: run validation
4. `document`: update queue status or handoff evidence when applicable

Each task should have:

- stable `task_id`
- clear `title`
- initial `status`
- `type`
- focused `owned_paths`
- concrete `done_when`

## IMPLEMENTATION_BRIEF.md

Keep the brief short and operational. Include:

- `Goal`
- `Read First`
- `Do`
- `Do Not`
- `Owned Paths`
- `Validation`
- `Stop Conditions`

The brief is for the next implementation agent. It should not explain the
entire planning conversation.

## Queue Update

After selecting:

- set candidate `status` to `selected`
- add `selection.selected_change_id`
- add `selection.reason`
- add `selection.selected_at` when the date is known
- append a top-level `operations` entry with `operation_type: select`
- update `next_recommended_candidate_id` only if the queue has another obvious
  ready candidate

After implementation completes, the implementation agent should set status to
`done` and add completion evidence.

## Operation Log Expectations

When select-change mutates a queue, append an operation item:

```yaml
operations:
  - operation_id: OP004
    operation_type: select
    target_candidate_ids:
      - P002
    actor: agent
    reason: Candidate is ready and unlocks P005.
    changed_at: 2026-05-21
    before_status: ready
    after_status: selected
    evidence:
      - changes/<selected-change-id>/SELECTED_CHANGE.yaml
```

Do not create selection artifacts without updating the operation log when the
queue already uses `operations`.
