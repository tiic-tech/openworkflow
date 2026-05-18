# OpenWorkflow Agent Guide

## Mission

This folder is for designing and maintaining OpenWorkflow: a contract-first
skill system for AI-assisted software development workflows.

The work here should produce reusable workflow contracts, skill designs,
schemas, scripts, and examples that can later be installed into real
repositories.

## Current Source Of Truth

- `build_system_vision.md` captures the initial system vision and proposed
  skill map.
- `references/contract-graph.md` defines OpenWorkflow v0 contract graph rules.
- `schemas/` contains the v0 schema surface for common contracts, workflow
  indexes, contract graphs, changes, and work items.
- `changes/M01-contract-foundation/` records the active M01 change contract,
  acceptance bar, and work item breakdown.
- `skills/` contains repo-local skill implementations. `build-team` and
  `run-team` preserve the initial downstream execution skills; `build-workflow`
  initializes upstream contract infrastructure.
- `examples/golden-path/` is the minimum executable contract trace.
- Future changes should preserve the principle that workflow execution is
  derived from durable upstream contracts, not from chat memory.

## Working Rules

- Keep this folder independent from any single product repo.
- Prefer small, composable skills over one large workflow skill.
- Every proposed skill must define:
  - trigger conditions
  - input contracts
  - output contracts
  - files it may create or modify
  - validation steps
  - handoff target to the next skill
- Do not design a downstream execution skill without naming its upstream
  contract source.
- Do not rely on conversation history as a required dependency.
- Use explicit files, indexes, and schemas for anything that must survive a
  session boundary.

## Contract Layers

OpenWorkflow should treat these layers as separate responsibilities:

```txt
workflow infrastructure
context
vision
decisions
specs
changes
slices
team
runtime
execution
diagnosis
architecture governance
```

Runtime state is not a replacement for vision, spec, or change contracts.

## Directory Conventions

Use this project-level shape while the system is being designed:

```txt
openworkflow/
  AGENT.md
  build_system_vision.md
  changes/
  skills/
  schemas/
  examples/
  references/
  decisions/
  archive/
```

Create subfolders only when they contain real artifacts.

## Skill Design Bar

A skill is ready to implement only when its boundary is clear enough to answer:

- What problem does it solve?
- What previous contract does it consume?
- What next contract does it produce?
- What should it never do?
- What validation proves the handoff is usable?

If a skill cannot answer these questions, keep it in design notes instead of
creating a `SKILL.md`.

## Preferred Build Order

Start with the shared system before individual skills:

1. Define the OpenWorkflow contract graph.
2. Define core folder and index schemas.
3. Design `/build-workflow`.
4. Design `/build-context`.
5. Design `/build-vision`.
6. Design `/build-decision`.
7. Design `/build-spec`.
8. Design `/build-change`.
9. Design `/build-slices`.
10. Integrate with `/build-team` and `/run-team`.

## Validation Expectations

For any future implementation:

- Run `python3 scripts/validate_openworkflow.py --root .` before handoff when
  changing contracts, schemas, examples, or skills.
- Run schema validation when schemas exist.
- Confirm generated paths are repo-local and portable.
- Confirm each skill can run after context compaction.
- Confirm handoff files contain enough information for the next skill.
- Keep examples minimal but executable as workflow traces.

## Git And File Hygiene

- Do not overwrite existing files without reading them first.
- Archive superseded design notes instead of deleting them when they preserve
  useful reasoning.
- Keep generated examples separate from canonical schemas and skill docs.
- Avoid repo-specific names unless the artifact is explicitly an example.
