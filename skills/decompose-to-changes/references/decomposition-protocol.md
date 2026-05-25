# Decomposition Protocol

Use this reference when turning planning input into `CANDIDATE_CHANGES.yaml`,
`CANDIDATE_CHANGES.md`, and `SUMMARY.yaml`.

## Input Normalization

Capture the source as one of:

- `user_input`: direct instruction or pasted plan
- `planning_discussion`: latest session discussion
- `artifact`: named repo files such as `VISION.md` or `OW_DEVELOP_PLAN.md`
- `mixed`: a small set of explicit files plus session discussion

Prefer a narrow source set. Do not load archives, generated runtime state, or
unrelated implementation history unless the user names them.

## Candidate Shape

Each candidate should answer:

- What one outcome changes?
- Which paths own that outcome?
- What is explicitly out of scope?
- What must happen first?
- What downstream work does it unlock?
- How will an implementer verify it?
- What acceptance facts prove it is done?

Good candidates are small enough for one focused implementation pass. A
candidate is too broad when it owns multiple unrelated modules, mixes source
skill authoring with runtime command exposure, or requires both product design
and production implementation.

## Queue Scope Control

Before creating or maintaining candidates, decide the queue boundary separately
from the source discussion. The source may contain a full product vision,
multi-stage roadmap, or several future features; the queue must still remain a
reasonable development scope.

A valid queue usually covers exactly one of:

- one feature outcome
- one bounded module
- one command surface
- one artifact family
- one workflow slice

A queue is too broad when it contains multiple independent features, a large
module family, or candidates that would naturally require separate milestone
branches. In that case, choose the smallest current feature boundary that can
move development forward and record the rest outside the active `changes` list.

Use top-level `scope_control` for this decision:

```yaml
scope_control:
  current_boundary: Workflow command taxonomy and stage graph only.
  boundary_type: workflow_slice
  in_scope_rule: Include only candidates needed to complete this boundary.
  out_of_scope_rule: Record later features as deferred refs; do not include them as current candidates.
  deferred_features:
    - title: proto2html runtime contract
      reason: Separate command surface; needs its own DTC pass after taxonomy.
      suggested_plan_id: M74-proto2html-runtime-contract
```

`deferred_features` are not candidates and must not be referenced as
dependencies or unlocks. They are planning memory for future DTC passes. When a
deferred feature becomes active, create a new `CANDIDATE_CHANGES.yaml` queue
for that feature and cite the original queue as source evidence.

## Feat And Commit Cadence

The queue is the feat. `changes/<plan_id>/CANDIDATE_CHANGES.yaml` defines the
feature-sized planning boundary and should remain the durable source of truth
until that feature is complete or superseded.

Individual candidates are commit-sized changes inside the current feat. Do not
create sibling top-level folders such as `changes/<new-id>/` for every
candidate. Selection artifacts should live under the current feat folder, for
example:

```text
changes/<plan_id>/
  CANDIDATE_CHANGES.yaml
  CANDIDATE_CHANGES.md
  SUMMARY.yaml
  <candidate-id>-<slug>/
    SELECTED_CHANGE.yaml
    ATOM_TASKS.yaml
    IMPLEMENTATION_BRIEF.md
```

Open a new top-level feat folder only when a new decomposition queue is needed.
Otherwise, update the existing queue by candidate id and let each completed
candidate land as a normal git commit.

When the user grants Orchestrator authority for a broad goal, use
`references/orchestrator-selected-change-dispatch.md` to keep the CC as the
Orchestrator-owned boundary and each candidate as the SC-level dispatch
boundary. Do not inflate one candidate to cover several subagent assignments
just because one Orchestrator owns the queue.

## Branch Boundary

When creating a new queue, capture the branch context from
`git status --short --branch`.

Record the intended feat branch under:

```yaml
queue_policy:
  branch_boundary: codex/<feat-branch>
```

Use the current branch when it already matches the new feat. If branch creation
has not happened yet, record the proposed branch name and note the gap in
`SUMMARY.yaml`. Do not create or switch branches as part of this skill.

When maintaining an existing queue, preserve `queue_policy.branch_boundary`.
If the current branch differs from the recorded boundary, add an operation or
summary note explaining why maintenance is still valid.

## Status Guidance

Use these statuses:

- `ready`: dependencies are satisfied and the candidate can be selected.
- `candidate`: valid but blocked by incomplete dependencies or sequencing.
- `blocked`: cannot be clarified or implemented without an explicit decision.
- `deferred`: useful but intentionally postponed.
- `superseded`: replaced by a newer candidate; keep evidence.

When updating an existing queue, never renumber stable ids. If a candidate
changes meaningfully, add a note or create a new candidate rather than reusing
the old id for a different scope.

## Queue Maintenance Operations

Use queue maintenance when the user asks to inspect or surgically change an
existing `CANDIDATE_CHANGES.yaml`.

Supported operations:

- `query`: answer by candidate id, status, dependency, owned path, risk, or
  readiness.
- `add`: append a new candidate with a fresh stable id.
- `update`: change fields while preserving candidate identity.
- `status_change`: move between `candidate`, `ready`, `blocked`, `deferred`,
  `superseded`, `selected`, `in_progress`, or `done`.
- `split`: replace one broad candidate with multiple narrower candidates.
- `merge`: combine overlapping candidates by keeping one survivor and marking
  the others `superseded`.
- `priority_change`: update `next_recommended_candidate_id` or ready ordering.

Each mutating operation should append an item under top-level `operations`:

```yaml
operations:
  - operation_id: OP001
    operation_type: update
    target_candidate_ids:
      - C002
    actor: agent
    reason: Clarify owned paths before selection.
    changed_at: 2026-05-21
    before_status: candidate
    after_status: ready
    evidence:
      - changes/<id>/...
```

Use sequential operation ids such as `OP001`, `OP002`, `OP003`. If the queue
already has operations, continue the sequence.

Do not hard-delete historical candidates. Prefer `superseded`, `deferred`, or
`blocked`. Hard deletion is only acceptable for a malformed candidate created in
the same uncommitted operation; log the reason.

## High-Risk Decision Reports

Use `HIGH_RISK_DECISION_REPORT.md` when queue maintenance discovers that the
next work is high risk and needs user confirmation before implementation. This
is especially important for adapter delivery, generated runtime surfaces,
security, data handling, trust model, or broad architecture changes.

Report creation is a queue maintenance action. It does not select the high-risk
candidate and does not authorize implementation.

When creating or updating the report:

1. Keep the high-risk candidate id stable.
2. Preserve the candidate status unless the user explicitly asks to mark it
   `blocked`, `deferred`, or `superseded`.
3. Write or update `changes/<plan_id>/HIGH_RISK_DECISION_REPORT.md`.
4. Add the report path to `SUMMARY.yaml` outputs or notes.
5. Refresh `CANDIDATE_CHANGES.md` with the report path when useful.
6. Append an operation entry:

```yaml
operations:
  - operation_id: OP012
    operation_type: query
    target_candidate_ids:
      - C007
    actor: agent
    reason: High-risk stop converted into a decision report before implementation.
    changed_at: 2026-05-21
    before_status: candidate
    after_status: candidate
    evidence:
      - changes/<plan_id>/HIGH_RISK_DECISION_REPORT.md
```

Use `operation_type: block` only when the queue status or candidate status is
also changed to `blocked`. Use `query` when the report is informational and the
candidate remains in its current status.

Required report sections are defined in
`references/planning-artifact-contracts.md`.

Do not create multiple reports for the same risk boundary. Update the existing
report unless the new high-risk stop concerns a materially different decision.

## Output Checklist

`CANDIDATE_CHANGES.yaml` must include:

- `schema_version: 0.1.0`
- `contract_id: candidate_changes:<plan_id>`
- `contract_type: planning`
- `planning_artifact_type: candidate_changes`
- `plan_id`
- `title`
- `status`
- `source`
- `queue_policy`
- `selection_policy`
- `scope_control` when the source discussion spans more than one feature,
  command surface, artifact family, module, or workflow slice
- `queue_policy.branch_boundary` for new branch-governed queues
- `next_recommended_candidate_id` when appropriate
- `changes`
- `operations` when the queue has been maintained after initial creation

`CANDIDATE_CHANGES.md` should include:

- source-of-truth notice
- selection policy summary
- branch boundary when present
- next recommended candidate when present
- one compact section per candidate

`SUMMARY.yaml` should include:

- source summary
- scope boundary summary and deferred feature refs when present
- output paths
- branch boundary when present
- candidate count
- next recommended candidate
- unresolved questions
- validation commands run

## Review Before Finishing

Check that:

- every candidate has focused `owned_paths`
- the queue itself covers one feature, bounded module, command surface, artifact
  family, or workflow slice
- later or adjacent features are captured as deferred refs, not current
  candidates
- includes and excludes are both present
- dependencies reference stable candidate ids
- validation commands are realistic for this repo
- no candidate silently starts implementation
- generated or runtime paths are protected unless explicitly in scope
- every mutating maintenance edit has an operation log entry
- every status change preserves or adds evidence
- high-risk candidates that require confirmation have a linked report before
  implementation resumes
