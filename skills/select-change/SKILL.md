---
name: select-change
description: Select one implementable OpenWorkflow candidate change from CANDIDATE_CHANGES.yaml and create SELECTED_CHANGE.yaml, ATOM_TASKS.yaml, and IMPLEMENTATION_BRIEF.md. Use when a candidate queue exists and the user wants the next focused change prepared for implementation.
---

# Select Change

## Purpose

Choose one candidate change and turn it into implementation-ready planning
artifacts. This skill prepares the next change; it does not execute the
implementation.

## Read First

Read these only as needed:

- `references/planning-artifact-contracts.md`
- `skills/select-change/references/selection-protocol.md`
- The target `CANDIDATE_CHANGES.yaml`
- The matching `CANDIDATE_CHANGES.md` only as a readable aid

## Workflow

1. Run `git status --short --branch` and note whether the tree is dirty.
2. Read `CANDIDATE_CHANGES.yaml` as the source of truth.
3. Filter candidates to `ready` first. If none are ready, inspect `candidate`
   entries and report the blockers instead of forcing a selection.
4. Prefer `next_recommended_candidate_id` when it points to a ready candidate
   and the dependencies still hold.
5. Otherwise choose the candidate that best matches the queue's
   `selection_policy`, unlocks downstream work, has focused owned paths, and
   has realistic validation.
6. Create a new change folder, usually `changes/<selected_change_id>/`.
7. Write `SELECTED_CHANGE.yaml`, `ATOM_TASKS.yaml`, and
   `IMPLEMENTATION_BRIEF.md`.
8. Update the candidate queue:
   - set the selected candidate to `selected` or `in_progress`
   - add `selection.selected_change_id`
   - add concise `selection.reason`
   - leave all other candidates in place
9. Refresh `CANDIDATE_CHANGES.md` from the YAML facts.
10. Stop before implementation unless the user explicitly asks to continue.

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
- Do not implement the selected change.
- Do not widen scope beyond the selected candidate.
- Do not hand-edit generated `.agents/` or `.openworkflow/` surfaces unless the
  selected candidate explicitly owns those paths and the user accepts that
  scope.
