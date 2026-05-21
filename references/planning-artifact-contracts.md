# Planning Artifact Contracts

This reference defines the first durable planning artifacts used by
`decompose-to-changes` and `select-change`.

## Source Of Truth Rule

`CANDIDATE_CHANGES.yaml` is the source of truth. `CANDIDATE_CHANGES.md` is a
human-readable view. If they disagree, update YAML first, then refresh the
Markdown view.

Do not delete candidate entries when selection or implementation progresses.
Update status and attach selection or completion evidence.

Queues may also carry a top-level `operations` list. Use it to audit targeted
maintenance such as adding a candidate, updating a scope, changing priority,
selecting a candidate, or marking completion.

## Feat And Commit Cadence

Each `CANDIDATE_CHANGES.yaml` queue is a feat boundary. The top-level
`changes/<plan_id>/` folder owns the feature-sized planning source, readable
view, summary, operation log, and candidate-specific selection artifacts.

Each candidate inside that queue is a commit-sized change. A selected candidate
should normally write its `SELECTED_CHANGE.yaml`, `ATOM_TASKS.yaml`, and
`IMPLEMENTATION_BRIEF.md` under `changes/<plan_id>/<candidate-id>-<slug>/` and
complete with one coherent git commit.

Do not create a new top-level `changes/<id>/` folder for every candidate. Open a
new top-level folder only when `decompose-to-changes` creates a new queue for a
new feat, product theme, or broad planning source.

## Git Governance Link

Use `references/git-version-control-governance.md` as the source contract for
git and version-control boundaries. In that model:

- atom tasks are implementation checklist items
- selected changes are commit-sized units
- `CANDIDATE_CHANGES.yaml` queues are feat boundaries
- feat queues should have owning branches when they opt into branch governance
- pull requests summarize feat branches, not individual atom tasks
- merge or release is the integration boundary after review

Skills may inspect git state for planning and audit, but they must not perform
destructive or remote-impacting git operations unless the user explicitly asks
for that specific operation. Remote gh operations require separate governance.

## Issue Governance Link

Use `references/issue-governance.md` as the source contract for Issue
source-of-truth rules. Issues are intent sources, not direct selected changes.
When `gh` is unavailable or unauthorized, local issue artifacts may be tracked
in git. When the user authorizes `gh` and GitHub Issues are configured as the
source of truth, local OW artifacts should store linkage and audit evidence
rather than duplicate remote Issue bodies as authoritative text.

## Skill Lifecycle Link

When a selected planning change touches runtime skill generation, adapter
delivery, generated `.agents/**` files, or `.openworkflow/audit/**`, read
`references/skill-system-lifecycle.md` before implementation. That reference
defines OpenWorkflow's native skill file shape, XML-like protocol block
semantics, generated-surface ownership, and drift expectations.

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

Optional but recommended after maintenance:

- `operations`

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

Operation types:

- `query`
- `add`
- `update`
- `status_change`
- `split`
- `merge`
- `priority_change`
- `select`
- `complete`
- `remove`

Hard removal is discouraged. Use `superseded`, `deferred`, or `blocked` for
historical candidates. Only remove malformed candidates created in the same
uncommitted operation, and record why.

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

## HIGH_RISK_DECISION_REPORT.md

Purpose: stop high-risk implementation before it starts and give the user a
concrete decision packet. Use this report when the next candidate is
`risk: high`, when a selected candidate's blast radius grows into high risk, or
when continuing would require changing trust, delivery, generated-runtime, data,
security, or architecture boundaries.

The report belongs to the queue that encountered the high-risk stop:

```text
changes/<plan_id>/
  CANDIDATE_CHANGES.yaml
  CANDIDATE_CHANGES.md
  SUMMARY.yaml
  HIGH_RISK_DECISION_REPORT.md
```

If a queue needs multiple high-risk reports over time, update the existing
report when it covers the same decision boundary. Create a named variant only
when the new stop covers a materially different boundary.

Required sections:

- `Trigger`: why execution stopped now.
- `Change`: candidate id, title, status, and why the candidate is high risk.
- `Concrete Risks`: specific ways implementation could damage correctness,
  trust, generated surfaces, architecture, data, or user workflow.
- `Decision Options`: at least defer, design-only, narrow spike, and full
  implementation when those options make sense.
- `Recommended Path`: one recommended option with reasoning.
- `Guardrails`: constraints that must hold if the user approves progress.
- `Go Criteria`: what explicit user decision is required before implementation
  resumes.
- `Stop Criteria`: conditions that force another stop even after approval.
- `Validation Expectations`: commands or evidence required for any approved
  follow-up.

The report is evidence, not approval. Implementation may resume only after the
user explicitly approves a concrete decision option or narrower replacement
candidate.

Queue linkage:

- Add the report path to `SUMMARY.yaml` outputs or notes.
- Append an `operations` entry with `operation_type: query` or
  `operation_type: block` for the high-risk stop.
- Keep the high-risk candidate status unchanged unless the report recommends
  and the user approves a status transition such as `blocked`, `deferred`, or
  `superseded`.
- Do not create `SELECTED_CHANGE.yaml` for a high-risk candidate solely because
  the report exists.

## CHANGE_ANALYSIS.yaml

Purpose: compare one or more candidate queues and recommend the next `plan_id`
and `candidate_id` for `select-change` without selecting or implementing the
candidate.

Required top-level fields:

- `schema_version`
- `contract_id`
- `contract_type: planning`
- `planning_artifact_type: change_analysis`
- `analysis_id`
- `status`
- `source`
- `git_state`
- `recommendation`
- `rejected_alternatives`
- `high_risk_stop`
- `validation`

`recommendation` should include:

- `target_plan_id`
- `target_candidate_id`
- `action`
- `reason`

Allowed actions include `handoff_to_select_change`, `queue_maintenance`,
`high_risk_report`, and `commit_current_work`.

The analysis artifact is advisory. It must not create
`SELECTED_CHANGE.yaml`, mutate candidate status, or authorize high-risk
implementation. `select-change` owns selection artifacts after consuming a
recommended target.

## Status Update Rules

When select-change chooses a candidate:

1. Set candidate `status` to `selected`.
2. Add `selection.selected_change_id`.
3. Add concise `selection.reason`.
4. Append an `operations` entry with `operation_type: select`.
5. Write `SELECTED_CHANGE.yaml`, `ATOM_TASKS.yaml`, and
   `IMPLEMENTATION_BRIEF.md`.

When the selected change completes:

1. Set candidate `status` to `done`.
2. Add `completion.completed_by_change_id`.
3. Add evidence such as change artifacts, validation commands, or commit ids.
4. Append an `operations` entry with `operation_type: complete`.
5. Leave other candidates in place for future selection.
