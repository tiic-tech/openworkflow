# Audit-First Discovery Loop

M09 deepens the discovery loop without turning OpenWorkflow into a large
one-shot specification generator. The core rule is:

> Every command must be auditable from a small context packet before it starts
> and from a small evidence packet after it finishes.

The discovery loop is:

```txt
/ow:vision -> /ow:validation -> /ow:prototype -> /ow:decision
```

## Why Audit-First

The goal is not to create more artifacts. The goal is to make the minimum
necessary artifacts precise enough that a later agent can resume work from a
small, exact context load.

That means each command needs explicit answers to:

- What files must be read?
- What files may be read if needed?
- What files must not be loaded by default?
- What files may be written?
- What files must not be created yet?
- What checkpoint proves the command stayed inside scope?

## Context Packet Shape

Each command owns a context packet:

```yaml
command: /ow:validation
required:
  - .openworkflow/workflow/WORKFLOW_INDEX.yaml
  - .openworkflow/vision/VISION_CONTRACT.yaml
optional:
  - .openworkflow/context/CONTEXT_MAP.yaml
forbidden:
  - .openworkflow/runtime/**
allowed_outputs:
  - .openworkflow/validation/**
forbidden_outputs:
  - .openworkflow/specs/**
  - .openworkflow/changes/**
audit_checkpoints:
  before:
    - Confirm required files exist.
  after:
    - Confirm no forbidden outputs were created.
```

## Discovery Loop Invariants

- `/ow:vision` clarifies direction; it does not prioritize or prototype.
- `/ow:validation` identifies what must be proven first; it does not build.
- `/ow:prototype` builds only the smallest validation artifact; it does not
  create production specs, changes, teams, persistence, or hardening.
- `/ow:decision` records the user-reviewed result; it is the only discovery
  command that can authorize `/ow:spec`.

## Command Depth Standard

Deepened generated commands should stay compact. They should include:

- purpose
- interaction mode
- required context
- optional context
- forbidden context
- allowed outputs
- forbidden outputs
- audit checkpoints
- anti-patterns
- handoff target

The command file should not contain full schemas or long reference material.
Those belong in `.openworkflow/` indexes and repo references.

## M09 Boundary

M09 deepens only the discovery loop. `/ow:spec`, `/ow:change`, and `/ow:team`
remain shallow until the discovery loop is accepted.
