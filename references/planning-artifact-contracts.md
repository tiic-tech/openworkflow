# Planning Artifact Contracts

This reference defines the first durable planning artifacts used by
`decompose-to-changes` and `select-change`.

## Source Of Truth Rule

`CANDIDATE_CHANGES.yaml` is the source of truth. `CANDIDATE_CHANGES.md` is a
human-readable view. If they disagree, update YAML first, then refresh the
Markdown view.

Do not delete candidate entries when selection or implementation progresses.
Update status and attach selection or completion evidence.

## CANDIDATE_CHANGES.yaml

Purpose: hold one active planning queue for a topic, milestone, or session.

Required top-level fields:

- `schema_version`
- `contract_id`
- `contract_type: planning`
- `planning_artifact_type: candidate_changes`
- `plan_id`
- `title`
- `status`
- `source`
- `queue_policy`
- `selection_policy`
- `changes`

Each candidate change requires:

- `id`
- `status`
- `title`
- `purpose`
- `scope.includes`
- `scope.excludes`
- `owned_paths`
- `dependencies`
- `unlocks`
- `risk`
- `size`
- `validation`
- `acceptance`

Candidate statuses:

- `candidate`: captured but not ready to implement.
- `ready`: implementable when selected.
- `selected`: chosen for a concrete selected change artifact.
- `in_progress`: implementation has started.
- `done`: completed and backed by evidence.
- `blocked`: cannot proceed without a blocker resolution.
- `deferred`: intentionally postponed.
- `superseded`: replaced by another candidate.

## SELECTED_CHANGE.yaml

Purpose: preserve why one candidate was selected and define implementation
boundaries before atom tasks begin.

Required fields:

- `schema_version`
- `contract_id`
- `contract_type: planning`
- `planning_artifact_type: selected_change`
- `selected_change_id`
- `source_plan_id`
- `source_candidate_id`
- `title`
- `status`
- `selection_reason`
- `scope.includes`
- `scope.excludes`
- `owned_paths`
- `forbidden_paths`
- `acceptance`
- `validation`

The selected change must name rejected alternatives when the choice is not
obvious. Rejected alternatives should be short and should reference candidate
ids, not copy the full candidate body.

## ATOM_TASKS.yaml

Purpose: break one selected change into focused tasks an Agent can execute
without widening scope.

Required top-level fields:

- `schema_version`
- `contract_id`
- `contract_type: planning`
- `planning_artifact_type: atom_tasks`
- `selected_change_id`
- `title`
- `status`
- `tasks`

Each atom task requires:

- `task_id`
- `title`
- `status`
- `type`
- `owned_paths`
- `done_when`

Task types:

- `read`: inspect existing context.
- `edit`: modify source artifacts.
- `verify`: run commands or checks.
- `document`: update planning or handoff artifacts.

An atom task should own one coherent area. If a task needs unrelated paths, split
it.

## IMPLEMENTATION_BRIEF.md

Purpose: provide a low-context implementation entry for the selected change.

Required sections:

- `Goal`
- `Read First`
- `Do`
- `Do Not`
- `Owned Paths`
- `Validation`
- `Stop Conditions`

The brief should be short. It should not duplicate the entire candidate queue or
long product discussion.

## Status Update Rules

When select-change chooses a candidate:

1. Set candidate `status` to `selected` or `in_progress`.
2. Add `selection.selected_change_id`.
3. Add concise `selection.reason`.
4. Write `SELECTED_CHANGE.yaml`, `ATOM_TASKS.yaml`, and
   `IMPLEMENTATION_BRIEF.md`.

When the selected change completes:

1. Set candidate `status` to `done`.
2. Add `completion.completed_by_change_id`.
3. Add evidence such as change artifacts, validation commands, or commit ids.
4. Leave other candidates in place for future selection.
