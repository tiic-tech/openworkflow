# OpenWorkflow Contract Graph v0

## Purpose

The contract graph is the durable map between upstream intent and downstream
runtime execution. It makes every Agent Team action traceable to repo-local
files instead of chat history.

## Contract Types

OpenWorkflow v0 recognizes these contract types:

- `workflow`: repo-local workflow indexes and graph metadata
- `context`: shared project vocabulary, repo map, and source references
- `vision`: durable project direction, goals, non-goals, and priorities
- `decision`: architectural, product, tooling, and workflow decisions
- `spec`: binding product, technical, UX, QA, security, or performance specs
- `validation`: critical assumption ranking and prototype briefs that decide
  what must be proven before a change becomes implementation work
- `change`: the current bounded delivery scope
- `work_items`: dependency-ordered slices and atom tasks for a change
- `team`: Agent Team role topology and delegation boundaries
- `runtime`: execution state, milestones, agent sessions, reviews, and QA

## Common Metadata

Every contract file should expose these fields when the format supports them:

```yaml
schema_version: 0.1.0
contract_id: change:m01-contract-foundation
contract_type: change
title: M01 contract foundation
status: active
source_artifacts: []
depends_on: []
produces: []
updated_at: null
```

Allowed `status` values:

```txt
draft, active, superseded, archived
```

`contract_id` values use `<contract_type>:<stable-slug>`. Decision contracts
may use ADR identifiers, such as `decision:ADR-0001`.

## Graph Rules

- Paths must be repo-local and must not require absolute machine paths.
- `depends_on` points to upstream contract ids, not prose descriptions.
- `produces` points to downstream contract ids when the next artifact is known.
- Runtime contracts may depend on team and work item contracts, but runtime
  state must not replace upstream contracts.
- Archives preserve superseded reasoning; new work should cite archived
  contracts instead of editing history silently.

## Minimum Flow

```txt
workflow
  -> context
  -> vision
  -> decision
  -> spec
  -> validation
  -> change
  -> work_items
  -> team
  -> runtime
```

Validation precedes binding change contracts when the core experience,
technical feasibility, or product value is uncertain. Early repositories may
skip context, vision, decisions, specs, or validation only by recording the
missing upstream layer in the change contract assumptions.

## Validation-First Rule

Do not convert a broad idea directly into implementation tasks when the core
product assumption is unproven. First identify the feature or behavior without
which the vision fails, then write the smallest prototype brief that can test
that assumption.

Validation artifacts should answer:

- Which features are existential, supporting, later, or explicitly out of scope?
- Which assumption is most likely to invalidate the vision?
- What is the smallest prototype that can prove or disprove it?
- What evidence will decide whether to continue, pivot, or stop?
