---
name: select-change
description: Select, inspect, or prepare one implementable OpenWorkflow candidate change from CANDIDATE_CHANGES.yaml and create SELECTED_CHANGE.yaml, ATOM_TASKS.yaml, and IMPLEMENTATION_BRIEF.md. Use when a candidate queue exists and the user wants the next focused change prepared for implementation, or when a specific candidate id needs readiness review before selection.
---

# Select Change

## Purpose

Choose one candidate change and turn it into implementation-ready planning
artifacts. This skill prepares the next change; it does not execute the
implementation.

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

## Read First

Read these only as needed:

- `references/planning-artifact-contracts.md`
- `skills/select-change/references/selection-protocol.md`
- The target `CANDIDATE_CHANGES.yaml`
- The matching `CANDIDATE_CHANGES.md` only as a readable aid

## Workflow

1. Run `git status --short --branch` and note whether the tree is dirty.
2. Read `CANDIDATE_CHANGES.yaml` as the source of truth.
3. If the user names a candidate id, perform targeted readiness review for
   that id before considering the rest of the queue.
4. Filter candidates to `ready` first. If none are ready, inspect `candidate`
   entries and report the blockers instead of forcing a selection.
5. Prefer `next_recommended_candidate_id` when it points to a ready candidate
   and the dependencies still hold.
6. Otherwise choose the candidate that best matches the queue's
   `selection_policy`, unlocks downstream work, has focused owned paths, and
   has realistic validation.
7. If the candidate is `risk: high`, stop before selection unless the user has
   explicitly approved a concrete decision option from a high-risk decision
   report.
8. Create a candidate-specific folder inside the current feat folder, usually
   `changes/<plan_id>/<candidate-id>-<slug>/`.
9. Write `SELECTED_CHANGE.yaml`, `ATOM_TASKS.yaml`, and
   `IMPLEMENTATION_BRIEF.md`.
10. Update the candidate queue:
   - set the selected candidate to `selected`
   - add `selection.selected_change_id`
   - add concise `selection.reason`
   - append an `operations` entry for the selection
   - leave all other candidates in place
11. Refresh `CANDIDATE_CHANGES.md` from the YAML facts.
12. Stop before implementation unless the user explicitly asks to continue.

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
- Do not implement the selected change.
- Do not mark the candidate `done`; implementation completion owns that update.
- Do not widen scope beyond the selected candidate.
- Do not hand-edit generated `.agents/` or `.openworkflow/` surfaces unless the
  selected candidate explicitly owns those paths and the user accepts that
  scope.
