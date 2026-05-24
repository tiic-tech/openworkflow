---
name: select-change
description: Select, inspect, or prepare one implementable OpenWorkflow candidate change from CANDIDATE_CHANGES.yaml and create SELECTED_CHANGE.yaml, ATOM_TASKS.yaml, and IMPLEMENTATION_BRIEF.md. Use when a candidate queue exists and the user wants the next focused change prepared for implementation, or when a specific candidate id needs readiness review before selection.
---

# Select Change

## Purpose

Choose one candidate change and turn it into implementation-ready planning
artifacts. This skill prepares the next change; it does not execute the
implementation.

By default, operate on one active queue and rank candidates inside that queue.
Use cross-queue arbitration only when the user provides multiple queues, points
to a cross-queue `CHANGE_ANALYSIS.yaml`, or asks which queue and candidate
should go next.

SC is not only a "mark selected" command. In a single queue it owns
prioritization, readiness review, risk gating, selection, and atomization.

## Feat Boundary

The source `CANDIDATE_CHANGES.yaml` is the feat boundary. A selected candidate
is a commit-sized slice inside that feat, not a new top-level feat. By default,
write selection artifacts under the existing queue folder:

```text
changes/<plan_id>/<candidate-id>-<slug>/
  SELECTED_CHANGE.yaml
  ATOM_TASKS.yaml
  IMPLEMENTATION_BRIEF.md
```

Create a new top-level `changes/<id>/` only when the user explicitly starts a
new decomposition queue or the existing queue is no longer the owning feat.

## Git Boundary

Use `git status --short --branch` as a read-only guard before selection.

If the queue has `queue_policy.branch_boundary`, compare it with the current
branch. When they differ, stop before creating selection artifacts unless the
user explicitly says this is a planning-only exception or asks to proceed on the
current branch. Do not switch branches from this skill.

If the working tree is dirty, inspect whether the changes are only the current
selection operation. If the dirty tree appears to contain an uncommitted
previous selected change or unrelated implementation work, stop and recommend
committing, stashing, or resolving that work before selecting another
candidate. Do not commit, stash, reset, restore, or clean from this skill.

## Read First

Read these only as needed:

- `references/planning-artifact-contracts.md`
- `skills/select-change/references/selection-protocol.md`
- The target `CANDIDATE_CHANGES.yaml`
- The matching `CANDIDATE_CHANGES.md` only as a readable aid
- `CHANGE_ANALYSIS.yaml` only when consuming a cross-queue recommendation

## Workflow

1. Run `git status --short --branch` and note current branch and dirty paths.
2. Read `CANDIDATE_CHANGES.yaml` as the source of truth.
3. Check `queue_policy.branch_boundary` when present. Stop on branch mismatch
   unless the user has approved a planning-only exception.
4. Check dirty-tree state. Stop if uncommitted work would contaminate a new
   selected change or blur the one-change-one-commit boundary.
5. If the user names a candidate id, perform targeted readiness review for
   that id before considering the rest of the queue.
6. If the user provides multiple queues or a cross-queue `CHANGE_ANALYSIS.yaml`,
   run the cross-queue arbitration path before choosing a target queue.
7. Filter candidates to `ready` first. If none are ready, inspect `candidate`
   entries and report the blockers instead of forcing a selection.
8. Rank the current queue directly:
   - prefer `next_recommended_candidate_id` when it points to a ready candidate
     and dependencies still hold
   - otherwise prefer dependency-satisfied candidates that best match
     `selection_policy`
   - then prefer unlock value, focused owned paths, realistic validation,
     lower risk, and user recency
9. Choose exactly one candidate from the owning queue.
10. If the candidate is `risk: high`, stop before selection unless the user has
   explicitly approved a concrete decision option from a high-risk decision
   report.
11. Create a candidate-specific folder inside the current feat folder, usually
   `changes/<plan_id>/<candidate-id>-<slug>/`.
12. Write `SELECTED_CHANGE.yaml`, `ATOM_TASKS.yaml`, and
   `IMPLEMENTATION_BRIEF.md`.
13. Update the candidate queue:
   - set the selected candidate to `selected`
   - add `selection.selected_change_id`
   - add concise `selection.reason`
   - append an `operations` entry for the selection
   - leave all other candidates in place
14. Refresh `CANDIDATE_CHANGES.md` from the YAML facts.
15. Stop before implementation unless the user explicitly asks to continue.

## Cross-Queue Arbitration

Cross-queue arbitration is explicit and exceptional. Do not discover every
queue in the repo unless the user asks for a global comparison or provides an
existing cross-queue `CHANGE_ANALYSIS.yaml`.

Do not invoke `analyze-changes` for a normal single-queue selection. The
single-queue path above is the default and should be sufficient for
prioritizing candidates inside one `CANDIDATE_CHANGES.yaml`.

When arbitration is active:

- Prefer an existing `CHANGE_ANALYSIS.yaml` produced by `analyze-changes`.
- Confirm the recommended `target_plan_id` and `target_candidate_id` still
  exist, are not done, and satisfy dependencies.
- Re-run branch-boundary, dirty-tree, and high-risk gates against the target
  queue before writing selection artifacts.
- Keep selection artifacts inside the target queue folder, not inside the
  analysis folder.
- Record rejected alternatives in `SELECTED_CHANGE.yaml` with `plan_id`,
  `candidate_id`, and a concise reason.
- If no candidate is clearly safe to select, stop and recommend queue
  maintenance, a high-risk report, or a fresh `analyze-changes` run.

Use a separate meta-selection artifact only when the user's requested output is
itself an analysis or governance decision. Normal implementation selection
should select one candidate inside the target queue.

## Targeted Review

When reviewing a specific candidate id, report:

- current status and readiness
- dependencies and whether each is satisfied
- owned paths and likely conflict surfaces
- validation commands
- acceptance gaps
- high-risk decision report status when `risk: high`
- blockers or reasons it should not be selected
- exact queue maintenance operation needed, if any

Do not select a candidate during targeted review unless the user asks to select
or the current workflow explicitly requires selection.

## High-Risk Stop Gate

For any `risk: high` candidate, do not create `SELECTED_CHANGE.yaml`,
`ATOM_TASKS.yaml`, or `IMPLEMENTATION_BRIEF.md` unless the user explicitly
approves a concrete decision option from a `HIGH_RISK_DECISION_REPORT.md`.

When a high-risk candidate is next:

- Report the candidate id, title, status, and why it is high risk.
- Reference the existing `HIGH_RISK_DECISION_REPORT.md` when present.
- If no report exists, instruct `decompose-to-changes` or queue maintenance to
  create one under the owning queue folder.
- Name the decision options and recommended path from the report when known.
- State the exact resume condition: user approval of a concrete option.
- Leave the candidate status unchanged unless the user asks to block, defer, or
  supersede it.

If the user explicitly approves a high-risk option, the selection reason must
name the approved option and the guardrails from the report. Keep atom tasks
narrow enough to match that approved option.

## Atom Task Rules

- Create tasks that map to coherent owned paths.
- Keep each task small enough for one focused implementation pass.
- Use `read`, `edit`, `document`, and `verify` task types.
- Include `done_when` criteria that an implementation agent can verify.
- Add forbidden paths in `SELECTED_CHANGE.yaml` when generated or unrelated
  surfaces should not be touched.

## Selection Boundaries

- Do not delete or renumber candidate ids.
- Do not silently select a blocked candidate.
- Do not silently select a `risk: high` candidate.
- Do not select on the wrong branch without explicit planning-only approval.
- Do not select when unrelated dirty-tree work would contaminate the commit boundary.
- Do not implement the selected change.
- Do not create commits, switch branches, stash, reset, restore, or clean.
- Do not mark the candidate `done`; implementation completion owns that update.
- Do not widen scope beyond the selected candidate.
- Do not hand-edit generated `.agents/` or `.openworkflow/` surfaces unless the
  selected candidate explicitly owns those paths and the user accepts that
  scope.
