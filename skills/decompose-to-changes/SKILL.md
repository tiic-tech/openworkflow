---
name: decompose-to-changes
description: Create, update, query, or maintain an OpenWorkflow CANDIDATE_CHANGES queue from explicit source text, the latest planning discussion, or selected repo artifacts. Use when a broad goal, roadmap topic, prototype redesign, feature idea, or existing candidate queue needs to be split into focused implementable changes, surgically edited by candidate id, or prepared before select-change or implementation begins.
---

# Decompose To Changes

## Purpose

Turn ambiguous planning input into a durable candidate change queue. This skill
plans change boundaries; it does not select one change for implementation and
does not implement code.

## Feat Boundary

Treat each `CANDIDATE_CHANGES.yaml` produced by this skill as one complete feat
boundary. The top-level folder `changes/<plan_id>/` owns the feat-level queue,
summary, and audit history. Candidate changes inside that queue are
commit-sized slices of the feat, not separate top-level feats.

Before writing candidates, perform a scope triage. A queue may cover one
feature, one bounded module, one command surface, one artifact family, or one
workflow slice. It must not become a roadmap bucket for multiple features or a
large module family just because the source discussion contains a deep vision.

When the source includes more features than the current queue can responsibly
own, record those features as future refs in `scope_control.deferred_features`
or `SUMMARY.yaml` notes. Do not include them as current `changes` candidates
unless they are inside the selected queue boundary.

Create a new top-level `changes/<plan_id>/` only for a new decomposition queue,
product theme, or broad planning source. When the current queue still owns the
work, maintain that queue and let `select-change` create candidate-specific
selection artifacts inside the existing feat folder.

## Branch Boundary

When creating a new feat queue, capture the current branch from
`git status --short --branch` and decide the intended feat branch. Record it in
`queue_policy.branch_boundary` and in `SUMMARY.yaml`.

Do not automatically create or switch branches from this skill. If the agent or
user already created the branch, record it. If the queue is being planned before
branch creation, record the proposed branch name and note that the branch still
needs to be created before implementation begins.

For queue maintenance, preserve the existing branch boundary. If the current
branch differs, record the observation in the operation reason or summary notes
instead of silently changing the boundary.

## Read First

Read these only as needed:

- `references/planning-artifact-contracts.md`
- `skills/decompose-to-changes/references/decomposition-protocol.md`
- Existing `CANDIDATE_CHANGES.yaml` when updating a queue
- User-specified source files or the latest session discussion

## Workflow

1. Run `git status --short --branch` and note whether the tree is dirty.
2. Decide whether this is decomposition mode or queue maintenance mode:
   - use decomposition mode for new broad goals or new planning sources
   - use queue maintenance mode for add, query, update, defer, block,
     supersede, split, merge, or priority changes in an existing queue
3. Identify the planning source:
   - explicit user-provided text or files first
   - latest session discussion when the user refers to "current discussion"
   - repo vision, roadmap, or existing OpenWorkflow artifacts only when needed
4. Choose a `plan_id` and output location. Default to
   `changes/<plan_id>/CANDIDATE_CHANGES.yaml`; this folder is the feat root for
   all candidate commits in the queue.
5. In decomposition mode, choose or confirm the feat branch boundary and record
   it as `queue_policy.branch_boundary`.
6. If updating an existing queue, preserve existing candidate ids, branch
   boundary, and history.
   Add new ids only for genuinely new candidates.
7. Run the queue scope gate:
   - name the current feature boundary in `scope_control.current_boundary`
   - decide which discussed features are outside that boundary
   - record outside features as deferred refs, not current candidates
   - if the remaining queue would still span multiple features or a broad
     module family, split the planning source into separate future queues
8. Decompose the in-bound source into candidates with focused owned paths, explicit
   includes and excludes, dependencies, validation, and acceptance.
9. For queue maintenance, write an `operations` entry for every targeted
   change. Include the operation type, target id, reason, and evidence.
10. If the current queue reaches one or more `risk: high` candidates that need
   user confirmation, create or update `HIGH_RISK_DECISION_REPORT.md` in the
   owning queue folder before implementation continues.
11. Write `CANDIDATE_CHANGES.yaml` first. Then write
   `CANDIDATE_CHANGES.md` as a non-authoritative readable view.
12. Write `SUMMARY.yaml` with source refs, candidate count, branch boundary,
    key dependencies, risks, and the optional next recommended candidate.
13. Run repository validation when available, usually `npm run validate`.

## Candidate Rules

- Assign stable ids such as `C001`, `C002`, `C003`.
- Prefer one module, feature, command surface, artifact family, or workflow
  slice per candidate.
- Prefer one feature, bounded module, command surface, artifact family, or
  workflow slice per queue. A queue that needs several independent feature
  outcomes is too broad even when every candidate is individually small.
- Split candidates that require unrelated owned paths or mix planning,
  implementation, and runtime exposure.
- Do not include "later but known" features as normal candidates in the current
  queue. Capture them as deferred refs with enough title, rationale, and
  suggested future queue hints for a later DTC pass.
- Use dependencies and unlocks instead of forcing one sorted backlog.
- Set `next_recommended_candidate_id` only when one candidate clearly unlocks
  the rest.
- Keep Markdown synchronized with YAML, but treat YAML as the source of truth.

## Queue Maintenance

For an existing queue, operate by stable candidate id.

- `query`: inspect one candidate or a filtered set without changing status.
- `add`: append a new candidate with a new stable id.
- `update`: revise scope, dependencies, validation, acceptance, or notes
  without changing the candidate's identity.
- `split`: keep the original candidate as `superseded` or narrowed, then add
  replacement candidates with new ids.
- `merge`: mark redundant candidates as `superseded` and point to the survivor.
- `defer`, `block`, `restore`, `supersede`, `complete`: status transitions
  with evidence.
- `remove`: do not hard-delete a historical candidate. Use `superseded`,
  `deferred`, or `blocked`. Hard deletion is allowed only for a malformed
  candidate created in the same uncommitted operation, and the operation log
  must say why.

Every maintenance edit must append an `operations` item to the YAML queue and
refresh the Markdown readable view.

## High-Risk Reports

When a queue's next actionable work is `risk: high`, or when the user asks for a
high-risk stop/report, produce a `HIGH_RISK_DECISION_REPORT.md` instead of
selecting or implementing the candidate. Use
`references/planning-artifact-contracts.md` for the report contract.

High-risk report behavior:

- Keep candidate ids and candidate statuses stable unless the user explicitly
  approves a status change.
- Create the report under the owning queue folder, usually
  `changes/<plan_id>/HIGH_RISK_DECISION_REPORT.md`.
- Update an existing report when it covers the same decision boundary; do not
  create duplicate reports for the same high-risk stop.
- Link the report from `SUMMARY.yaml` outputs or notes.
- Add an `operations` entry with `operation_type: query` or `block` and the
  report path as evidence.
- Treat the report as a decision packet, not as approval to implement.

The report must include concrete risks, decision options, a recommended path,
guardrails, go criteria, stop criteria, and validation expectations.

## Boundaries

- Do not create `SELECTED_CHANGE.yaml`, `ATOM_TASKS.yaml`, or
  `IMPLEMENTATION_BRIEF.md`; that is `select-change`.
- Do not implement a candidate.
- Do not hand-edit generated `.agents/` or `.openworkflow/` surfaces unless the
  selected source explicitly owns those paths and the user accepts that scope.
- Do not delete completed, superseded, or deferred candidates. Update status
  and append evidence instead.
