---
name: decompose-to-changes
description: Create or update an OpenWorkflow CANDIDATE_CHANGES queue from explicit source text, the latest planning discussion, or selected repo artifacts. Use when a broad goal, roadmap topic, prototype redesign, or feature idea needs to be split into focused implementable changes before select-change or implementation begins.
---

# Decompose To Changes

## Purpose

Turn ambiguous planning input into a durable candidate change queue. This skill
plans change boundaries; it does not select one change for implementation and
does not implement code.

## Read First

Read these only as needed:

- `references/planning-artifact-contracts.md`
- `skills/decompose-to-changes/references/decomposition-protocol.md`
- Existing `CANDIDATE_CHANGES.yaml` when updating a queue
- User-specified source files or the latest session discussion

## Workflow

1. Run `git status --short --branch` and note whether the tree is dirty.
2. Identify the planning source:
   - explicit user-provided text or files first
   - latest session discussion when the user refers to "current discussion"
   - repo vision, roadmap, or existing OpenWorkflow artifacts only when needed
3. Choose a `plan_id` and output location. Default to
   `changes/<plan_id>/CANDIDATE_CHANGES.yaml`.
4. If updating an existing queue, preserve existing candidate ids and history.
   Add new ids only for genuinely new candidates.
5. Decompose the source into candidates with focused owned paths, explicit
   includes and excludes, dependencies, validation, and acceptance.
6. Write `CANDIDATE_CHANGES.yaml` first. Then write
   `CANDIDATE_CHANGES.md` as a non-authoritative readable view.
7. Write `SUMMARY.yaml` with source refs, candidate count, key dependencies,
   risks, and the optional next recommended candidate.
8. Run repository validation when available, usually `npm run validate`.

## Candidate Rules

- Assign stable ids such as `C001`, `C002`, `C003`.
- Prefer one module, feature, command surface, artifact family, or workflow
  slice per candidate.
- Split candidates that require unrelated owned paths or mix planning,
  implementation, and runtime exposure.
- Use dependencies and unlocks instead of forcing one sorted backlog.
- Set `next_recommended_candidate_id` only when one candidate clearly unlocks
  the rest.
- Keep Markdown synchronized with YAML, but treat YAML as the source of truth.

## Boundaries

- Do not create `SELECTED_CHANGE.yaml`, `ATOM_TASKS.yaml`, or
  `IMPLEMENTATION_BRIEF.md`; that is `select-change`.
- Do not implement a candidate.
- Do not hand-edit generated `.agents/` or `.openworkflow/` surfaces unless the
  selected source explicitly owns those paths and the user accepts that scope.
- Do not delete completed, superseded, or deferred candidates. Update status
  and append evidence instead.
