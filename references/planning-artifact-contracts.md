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

The queue boundary is intentionally smaller than a roadmap. A queue may own one
feature, bounded module, command surface, artifact family, or workflow slice. It
must not include multiple independent features or a large module family just
because the source discussion contains a deep product plan.

When planning input contains more features than the current queue should own,
record the extra features as deferred refs, usually under
`scope_control.deferred_features` in `CANDIDATE_CHANGES.yaml` and mirrored in
`SUMMARY.yaml`. Deferred refs are not candidates, do not participate in
dependencies or unlocks, and require a later `decompose-to-changes` pass before
selection or implementation.

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

Approved local git automation is limited to the boundaries in
`references/git-version-control-governance.md`: local feat branch handling,
one selected change to one local commit, and local `PR_READY_SUMMARY.md`
generation. Remote push, remote PR creation, Issue mutation, and merge require
separate explicit approval.

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

## Planning Artifact Registration

Planning artifacts can appear in Agent read models only through summary-first
registration. Runtime or adapter exposure must not load full planning history
by default.

Registration roles:

- `CANDIDATE_CHANGES.yaml`: source of truth for one feat queue. Load only when
  selecting, maintaining, completing, or auditing that queue.
- `SUMMARY.yaml`: default queue handoff and read-model artifact. It should name
  source refs, branch boundary, candidate count, completed candidate, next
  recommended candidate, high-risk report paths, validation, and unresolved
  questions.
- `CHANGE_ANALYSIS.yaml`: advisory cross-queue recommendation evidence. It may
  recommend a `target_plan_id` and `target_candidate_id`, but it must not
  mutate queues or authorize high-risk implementation.
- `SELECTED_CHANGE.yaml`: implementation boundary for one selected candidate.
  It should be loaded before `ATOM_TASKS.yaml` when executing or reviewing the
  selected change.
- `ATOM_TASKS.yaml`: task breakdown for the selected candidate. It is not a
  source of product scope beyond the selected change.
- `LOCAL_COMMIT_EVIDENCE.yaml`: local implementation evidence for a selected
  change. It records commit hashes and validation evidence, but does not imply
  remote push, PR creation, merge, or Issue mutation.
- `HIGH_RISK_DECISION_REPORT.md`: stop packet for high-risk candidates. It is
  evidence, not approval.

Minimum summary fields for planning queues:

- `plan_id`
- `branch_boundary`
- `candidate_count`
- `completed_candidate_id`
- `completed_change_id`
- `next_recommended_candidate_id`
- `outputs`
- `key_dependencies`
- `risks`
- `unresolved_questions`
- `validation`

Read-model order for planning work:

1. `SUMMARY.yaml`
2. `HIGH_RISK_DECISION_REPORT.md` only when the next candidate is high risk
3. `CHANGE_ANALYSIS.yaml` only when consuming a cross-queue recommendation
4. `SELECTED_CHANGE.yaml`
5. `ATOM_TASKS.yaml`
6. `CANDIDATE_CHANGES.yaml` only when source truth is needed

Validators should reject malformed source artifacts, but summary freshness and
quality are separate trust signals. Use `openworkflow summaries --json` or
handoff/inspect quality fields for summary trust rather than treating
`validate` alone as proof that a summary is sufficient.

## Agent Resume Packet Contract

`resume --json` is a read-only Agent recovery packet. It aggregates existing
trust gates and planning evidence into one startup cockpit without repairing
state, selecting candidates, updating summaries, creating commits, or changing
workflow pointers.

The JSON command must use the standard OpenWorkflow report envelope:

- `schema_version`
- `command: resume`
- `ok`
- `root`
- `data`
- `warnings`
- `errors`
- `health_errors`
- `effects`
- `next_actions`

The `data` packet should include these top-level sections:

- `resume_version`: contract version for the packet shape.
- `command_boundary`: read-only semantics, planned writes, forbidden writes,
  and deferred non-goals.
- `trust`: handoff-quality and readiness signals sourced from existing
  handoff, inspect, summaries, and check models.
- `workflow`: active stage, active pointers, current next command, and read
  order.
- `active_queue`: the most relevant planning queue when one can be identified,
  including plan id, queue path, branch boundary, queue status, selected
  candidate, completed candidate, next recommended candidate, and uncertainty.
- `current_work_item`: selected candidate or atom-task context when available,
  including selected-change id, status, title, risk, owned paths, atom task
  path, and implementation brief path.
- `actions`: recommended next action plus allowed actions, forbidden actions,
  and stop conditions derived from trust gates and queue boundaries.
- `evidence`: primary, auxiliary, comparison, and missing evidence paths.
- `git`: branch, cleanliness, dirty paths, and commit-evidence state when
  available without mutation.
- `sources`: source commands and files consulted to build the packet.

Text output should be a concise human-readable rendering of the same packet:
trust status, active queue/current work item, next action, blockers, and the
smallest read order. Text output must not hide JSON-only blockers.

Read-only boundary:

- The command may read `.openworkflow/CURRENT_STATE.yaml`, summary/current-slice
  artifacts, handoff/inspect/summaries/check models, planning queue summaries,
  selected-change artifacts, atom tasks, and git status.
- The command must not write workflow artifacts, summarize files, queue
  statuses, generated adapters, git evidence, branches, commits, or remote
  state.
- The command must report uncertainty instead of selecting work when multiple
  active queues compete or when queue evidence is stale.

Deferred work:

- Base aggregation and executable CLI entrypoint belong to the implementation
  candidate after the contract boundary.
- Active queue scanning beyond obvious current planning evidence belongs to a
  separate candidate.
- Detailed action/evidence classification belongs to a later candidate.
- Artifact lineage graph, prompt2proto strategy, provider/fallback metadata,
  and a write preflight compiler are out of scope for the resume packet.

Selected-change commit gate:

- New or actively touched branch-governed queues may opt into
  `queue_policy.selected_change_commit_gate: strict`.
- In strict mode, a `done` selected change must set
  `completion.implementation_changed_files` to `true` or `false`.
- When `implementation_changed_files: true`, `completion.evidence` must include
  a repo-relative `LOCAL_COMMIT_EVIDENCE.yaml` path for that selected change.
- When `implementation_changed_files: false`, completion must include
  `commit_not_required_reason` explaining why no implementation commit is
  required.
- Historical queues without the strict policy remain migration-mode artifacts
  until they are touched or intentionally opted into the gate.

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

- `scope_control` when the source discussion spans multiple possible features
- `operations`

Recommended `scope_control` fields:

- `current_boundary`
- `boundary_type`
- `in_scope_rule`
- `out_of_scope_rule`
- `deferred_features`

Each deferred feature should include:

- `title`
- `reason`
- `suggested_plan_id` when a likely future queue name is clear

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

When selection consumes a cross-queue recommendation, rejected alternatives
must include both `plan_id` and `candidate_id`:

```yaml
rejected_alternatives:
  - plan_id: M68-post-proto-workflow-planning
    candidate_id: H003
    reason: High risk and missing a local high-risk decision report.
```

Use a short `id` field only when the rejected candidate belongs to the same
`source_plan_id` as the selected change.

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

## LOCAL_COMMIT_EVIDENCE.yaml

Purpose: record the local commit evidence for one selected change without
implying any remote operation.

Required fields for new evidence files:

- `schema_version`
- `contract_id`
- `contract_type: planning`
- `planning_artifact_type: implementation_evidence`
- `source_plan_id`
- `source_candidate_id`
- `selected_change_id`
- `primary_commit`
- `validation_evidence`

Optional `coder_evidence` fields may be embedded in
`LOCAL_COMMIT_EVIDENCE.yaml` when an implementation change needs to bind
`/ow:coder` evidence beyond the guidance-only `coder_gate` state:

```yaml
coder_evidence:
  status: recorded # recorded | skipped | not_applicable
  enforcement: guidance_only
  preflight:
    - checked owned paths and validation ladder
  red_evidence:
    - failing structural assertion before implementation
  green_evidence:
    - passing structural assertion after implementation
  self_check:
    - reviewed generated surfaces and trust boundaries
  validation_ladder:
    - npm run build
    - npm run verify:runtime-surface
  lessons:
    - promote only repeated quality lessons into source policy
  notes: Optional concise context for later Agents.
```

`coder_evidence` is optional. Validators must accept missing coder evidence and
must reject malformed present coder evidence. Standalone `CODE_EVIDENCE.yaml`
or `CODER_EVIDENCE.yaml` is intentionally deferred to a separate future
candidate change.

Historical evidence files may use older field names such as `plan_id`,
`candidate_id`, `change_id`, and `implementation_commit`; validators accept
those during migration, but new git-automation evidence should use the source
field names above.

The owning `CANDIDATE_CHANGES.yaml` completion should reference the file in
`completion.evidence` using a repo-relative path:

```yaml
completion:
  implementation_changed_files: true
  evidence:
    - changes/<plan_id>/<candidate-id>-<slug>/LOCAL_COMMIT_EVIDENCE.yaml
```

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

When `select-change` consumes the recommendation, it should create selection
artifacts inside `changes/<target_plan_id>/`, re-check current readiness gates,
and copy only the decision-relevant rejected alternatives into
`SELECTED_CHANGE.yaml`. The analysis folder remains evidence for why the
cross-queue comparison happened; it is not the owning feat folder for the
selected candidate.

## PR_READY_SUMMARY.md

Purpose: summarize a feat branch for human PR review without creating,
editing, or opening a remote pull request.

The summary belongs to the completed or review-ready queue:

```text
changes/<plan_id>/PR_READY_SUMMARY.md
```

Required sections:

- `Feat`: plan id, title, branch boundary, and source queue path.
- `Completed Changes`: selected change ids, candidate ids, and commit evidence
  when available.
- `Deferred Or Blocked Changes`: candidates intentionally left out of the PR.
- `High-Risk Decisions`: linked reports and unresolved approvals.
- `Validation`: commands run and results.
- `Review Notes`: risks, assumptions, and follow-up queues.

The artifact is a handoff packet, not a remote operation. It must not imply
that a PR was opened, edited, pushed, merged, or approved. Any gh or GitHub
mutation must follow separate operation governance and user authorization.

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
