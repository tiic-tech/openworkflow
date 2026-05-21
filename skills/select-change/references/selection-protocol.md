# Selection Protocol

Use this reference when selecting one candidate from `CANDIDATE_CHANGES.yaml`
and preparing implementation artifacts.

## Selection Inputs

Required:

- `CANDIDATE_CHANGES.yaml`

Optional:

- `CANDIDATE_CHANGES.md` as a readable view
- upstream source artifacts named by the queue
- user constraints such as "choose C004" or "avoid runtime changes"
- top-level queue `operations` for audit history

If the user names a candidate id, verify that its dependencies are satisfied
before selecting it. If the id is blocked, not ready, or `risk: high`, report
why and stop unless the user explicitly approves the relevant risk or decision
option.

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

1. Exclude `done`, `blocked`, `deferred`, and `superseded` candidates.
2. Prefer `ready` candidates over plain `candidate` entries.
3. Honor `next_recommended_candidate_id` when it is ready and coherent.
4. Prefer candidates that unlock other candidates.
5. Prefer focused owned paths over cross-module changes.
6. Prefer clear validation over unclear or manual-only acceptance.
7. Prefer lower-risk dogfood or source behavior before runtime exposure.
8. Stop on `risk: high` unless explicit user approval names a concrete decision
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
- rejected alternatives when the choice is not obvious
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
