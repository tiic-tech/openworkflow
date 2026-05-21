# Workflow Blueprint Runtime Alignment

This reference aligns OpenWorkflow's command vocabulary with the intended
product-to-implementation workflow. It is a design reference, not runtime
registration. Adding a command to this document does not expose a CLI command,
generate adapter files, or authorize implementation.

## Scope

M73 owns the taxonomy and stage-graph alignment layer. It does not own detailed
runtime contracts for `proto2html`, `html2spec`, `build`, `change`, `review`,
`archive`, `build-agent`, or `build-skill`. Those surfaces remain deferred
features that require later DTC queues and, where marked high risk, explicit
approval before implementation.

## Command Families

OpenWorkflow commands fall into four families. The family controls how an Agent
should reason about the command before implementation details exist.

### Primary Workflow Commands

Primary workflow commands represent user-visible stages in the product-to-
implementation path. They move the project from intent to validated direction,
prototype evidence, implementation planning, execution, and closure.

Current or intended primary workflow commands:

- `/ow:vision`: establish or revise the product vision and durable intent.
- `/ow:validation`: identify the core assumption or feature that must be proven
  before deeper design or build work.
- `/ow:proto`: create image-first prototype evidence for product direction.
- `/ow:tune`: refine accepted prototype evidence without changing the product
  thesis unexpectedly.
- `/ow:proto2html`: convert the accepted benchmark prototype image into a
  high-fidelity HTML prototype.
- `/ow:html2spec`: extract implementation-ready specs from locked HTML
  prototype evidence.
- `/ow:build`: create project-specific agent team, skill, milestone, and
  workstream planning from approved specs.
- `/ow:change`: execute implementation through selected, bounded changes.
- `/ow:archive`: verify, close, and archive completed implementation work.

Only commands that own a stage transition belong in this family. Planning
helpers, analysis commands, and async checks should not be promoted into primary
workflow stages simply because they are important.

### Internal Planning And Decision Commands

Internal planning and decision commands produce decision intelligence for a
primary workflow stage. They may be invoked directly during dogfood development,
but their architectural role is subordinate to the stage they support.

Current planning intelligence commands:

- `/ow:decompose-to-changes`: create or maintain one bounded candidate-change
  queue for a feature, command surface, artifact family, module, or workflow
  slice.
- `/ow:analyze-changes`: recommend the next candidate from one or more queues
  without selecting or implementing it.
- `/ow:select-change`: select one implementable candidate and create
  implementation-ready planning artifacts.

These three commands are DTC, AC, and SC. They are the planning intelligence
inside `/ow:change`; they are not a replacement for the full OpenWorkflow
workflow and should not be treated as primary stages.

Decision behavior also belongs in this family. `/ow:decision` records review
outcomes and handoff decisions, but it should remain internal unless a later
queue proves that user-facing decision control is needed.

### Advanced Creation Commands

Advanced creation commands create reusable execution capability for a project.
They affect future implementation quality and therefore require stronger
boundaries than ordinary planning notes.

Intended advanced creation commands:

- `/ow:build-agent`: create a bounded repo-local agent role that can participate
  in `/ow:build`, `/ow:change`, or later workflow loops.
- `/ow:build-skill`: create a reusable procedural capability that can be
  registered for project-specific workflow use.

These commands are not primary workflow stages. They are capability factories
that should be governed by registry semantics, generated-surface ownership, and
high-risk approval when they affect adapter delivery or execution behavior.

### Asynchronous Support Commands

Asynchronous support commands monitor, review, or enrich workflow execution
without replacing the main stage sequence.

Intended asynchronous support command:

- `/ow:review`: monitor implementation output, check consistency against specs
  and accepted artifacts, and emit findings that inform the next planning loop.

`/ow:review` findings should become input evidence for `/ow:analyze-changes`
or `/ow:select-change`. They are not a parallel implementation plan and do not
authorize repairs without a selected change.

## Boundary Rules

- A command family is a design classification, not runtime exposure.
- Primary workflow commands own stage transitions.
- Internal planning commands advise or prepare a primary stage.
- Advanced creation commands create reusable agents or skills and need registry
  boundaries before runtime exposure.
- Async support commands produce evidence for later planning; they do not
  silently mutate implementation.
- DTC, AC, and SC must remain inside the `/ow:change` planning loop unless a
  later approved change deliberately revises the taxonomy.

## Deferred Work

The detailed stage graph is C012. The `/ow:change` planning intelligence
boundary is C013. The deferred feature handoff map is C014.
