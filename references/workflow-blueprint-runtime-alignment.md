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

## Stage Graph

The intended primary workflow chain is:

```text
/ow:vision
  -> /ow:validation
  -> /ow:proto
  -> /ow:tune          # optional, repeatable
  -> /ow:proto2html
  -> /ow:html2spec
  -> /ow:build
  -> /ow:change
  -> /ow:archive
```

The graph is a blueprint for stage responsibility. It does not mean every
listed command is already implemented, registered, or safe to expose at runtime.

### Stage Responsibilities

- `/ow:vision` creates or revises durable product intent.
- `/ow:validation` chooses the core assumption or feature that must be proven.
- `/ow:proto` explores the accepted direction through image-first prototype
  evidence.
- `/ow:tune` refines accepted prototype evidence. It is optional and repeatable;
  it should improve fidelity without silently changing the product thesis.
- `/ow:proto2html` reconstructs the accepted benchmark prototype image as a
  high-fidelity HTML prototype.
- `/ow:html2spec` turns locked HTML prototype evidence into implementation-ready
  specification artifacts.
- `/ow:build` turns approved specs into project-specific team, skill, milestone,
  and workstream planning.
- `/ow:change` executes selected, bounded implementation changes through the
  planning intelligence loop and implementation work.
- `/ow:archive` verifies and closes completed implementation work.

### Loop And Support Attachments

`/ow:tune` is the only loop inside the discovery/prototype segment. It can run
multiple times while the accepted prototype still needs refinement. Once the
benchmark prototype is accepted for reconstruction, downstream work should
avoid reopening product direction unless new validation evidence requires it.

`/ow:review` attaches to `/ow:change` as asynchronous support. It should produce
findings that influence the next analysis or selection pass, not bypass the
selected-change boundary.

`/ow:build-agent` and `/ow:build-skill` attach to `/ow:build` and later
workflow loops as advanced creation commands. They create capability that may be
used by implementation work, but they are not normal stage transitions.

### Deferred Stage Surfaces

The stage graph intentionally names future surfaces before they are implemented.
Detailed contracts for `proto2html`, `html2spec`, `build`, `change`, `review`,
`archive`, `build-agent`, and `build-skill` require separate DTC queues. The
next deferred queue after M73 should reassess `/ow:vision`, `/ow:validation`,
`/ow:proto`, and `/ow:tune` quality before `proto2html` proceeds.

## /ow:change Planning Intelligence Boundary

`/ow:change` is the implementation orchestration stage. It owns the loop that
turns approved build or milestone context into bounded implementation work,
evidence, review input, and completion handoff.

DTC, AC, and SC sit inside that loop as planning intelligence:

- DTC, `/ow:decompose-to-changes`, creates or maintains one bounded
  `CANDIDATE_CHANGES.yaml` queue for the current feature boundary.
- AC, `/ow:analyze-changes`, performs cross-queue priority analysis when more
  than one active queue competes for the next change.
- SC, `/ow:select-change`, ranks candidates inside one owning queue, selects one
  implementable candidate, and creates implementation-ready planning artifacts.

Single-queue work should normally go directly from DTC to SC. AC is not a
mandatory pre-step when there is only one active queue; using it for every
selection adds cost and weakens SC into a marker instead of a decision command.

### Planning Loop Inputs

At the boundary level, `/ow:change` can consume:

- approved specs or milestone plans from `/ow:build`
- an existing candidate queue from DTC
- review findings from `/ow:review`
- high-risk decision reports
- branch, dirty-tree, validation, and commit evidence
- user sequencing or approval constraints

### Planning Loop Outputs

The planning intelligence loop can produce:

- a bounded `CANDIDATE_CHANGES.yaml` queue
- optional cross-queue `CHANGE_ANALYSIS.yaml` when more than one queue competes
- `SELECTED_CHANGE.yaml`
- `ATOM_TASKS.yaml`
- `IMPLEMENTATION_BRIEF.md`
- high-risk stop packets when approval is required

These outputs prepare implementation. They do not by themselves implement the
selected change, update runtime registries, push to remote services, or approve
high-risk work.

### High-Risk Stops

A high-risk report is a stop packet. It names risks, options, guardrails, go
criteria, and stop criteria, but it is not approval. Selection or
implementation of high-risk work requires explicit user approval of a concrete
option from the report.

### Deferred /ow:change Runtime

This reference defines the planning-intelligence boundary only. Full
`/ow:change` orchestration, including how implementation agents run, how review
is triggered, and how archive completion is enforced, remains a deferred
feature and needs its own DTC queue.

## Deferred Work

The deferred feature handoff map is C014.
