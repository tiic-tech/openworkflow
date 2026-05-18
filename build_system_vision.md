# OpenWorkflow Build System Vision

## Purpose

OpenWorkflow is a contract-first workflow system for AI-assisted software
development. Its goal is to turn a vague user intent into a durable,
repo-local operating system that can survive context loss, agent handoff,
branch changes, and long-running development.

The core idea is simple: an Agent Team should not be created directly from a
single user request. The team should be derived from explicit upstream
contracts: vision, context, decisions, specs, and change scope.

## Key Finding

The current `build-team` and `run-team` skills solve the downstream execution
problem:

- `build-team` creates the Agent Team, runtime hierarchy, role boundaries, and
  state machine.
- `run-team` enters execution mode, selects or initializes scope runtime, and
  drives milestone and atom-task work.

What is missing is the upstream contract pipeline:

- Why does this repo exist?
- What language and context should every agent share?
- Which decisions are already settled?
- Which specs are binding?
- What exact change is being attempted now?
- Why does this change justify a team, and which agents are actually needed?

OpenWorkflow exists to fill that gap.

## Contract Stack

The workflow should be built around five durable layers:

```txt
Vision Contract
  -> Context Contract
  -> Decision Contract
  -> Spec Contract
  -> Change Contract
  -> Team Contract
  -> Runtime State
```

Each layer must be stored in files, not only in chat history.

## Proposed Skill Pipeline

```txt
/build-workflow
  -> /build-context
  -> /build-vision
  -> /build-decision
  -> /build-spec
  -> /build-prototype
  -> /build-change
  -> /build-slices
  -> /build-team
  -> /run-team
```

Event-driven supporting skills:

```txt
/build-intake
/build-diagnosis
/build-architecture
```

## Skill Responsibilities

### /build-workflow

Initializes the workflow operating system for a repository or standalone
project. It creates the shared folders, indexes, and contract graph used by all
other skills.

Expected contribution:

- establishes the canonical directory layout
- creates workflow indexes
- defines how contracts reference each other
- prevents every later skill from inventing its own structure

### /build-context

Builds shared project context: domain language, glossary, repo map, stakeholder
language, and source-of-truth references.

Expected contribution:

- reduces naming drift
- gives all future agents the same vocabulary
- separates contextual knowledge from executable specs

### /build-vision

Turns broad intent into a durable product or project direction.

Expected contribution:

- records why the repo exists
- defines goals, non-goals, users, quality bar, and decision priorities
- gives future changes a direction test

### /build-decision

Records architectural, product, workflow, and tooling decisions that should not
be rediscovered every session.

Expected contribution:

- prevents repeated debate over settled tradeoffs
- lets specs and changes cite decision records
- keeps reasoning separate from execution state

### /build-spec

Converts vision and decisions into binding technical, product, design, data,
UX, QA, performance, security, and accessibility specs.

Expected contribution:

- defines what must remain true
- gives review and QA objective acceptance bars
- provides the upstream contract for scope and team design

### /build-prototype

Creates throwaway or bounded prototypes when a spec is not yet knowable.

Expected contribution:

- validates uncertain interaction, architecture, state-machine, or UX ideas
- prevents speculative ideas from being prematurely locked into specs
- feeds validated findings back into decisions, specs, or changes

### /build-change

Defines the current change scope. It consumes vision, context, decisions, specs,
and repo state, then produces a concrete change contract.

Expected contribution:

- states what will change now
- states what will not change now
- maps relevant specs, affected areas, risks, and acceptance criteria
- decides whether the change needs a formal Agent Team

### /build-slices

Breaks a change contract into dependency-ordered vertical slices and atom work
items that can be assigned to agents.

Expected contribution:

- translates scope into executable work
- creates agent briefs before implementation starts
- makes dependencies and acceptance visible before runtime execution

### /build-team

Builds or regenerates the Agent Team from the upstream change and spec
contracts.

Expected contribution:

- creates role boundaries based on real work ownership
- initializes `.codex/runtime/`
- defines persistent and event-driven agent topology
- creates the runtime state machine

### /run-team

Executes the active runtime state.

Expected contribution:

- audits repo and runtime state
- selects or initializes the active scope
- drives milestone, atom task, review, QA, issue-fix, and checkpoint loops
- preserves agent lifecycle and `agent_id` tracking

### /build-intake

Triage entrypoint for new user input, feedback, bugs, ideas, and requests.

Expected contribution:

- prevents every request from becoming immediate implementation
- routes input to context, vision, spec, change, diagnosis, or backlog
- keeps the workflow stable under continuous new information

### /build-diagnosis

Debugging and investigation protocol for defects, regressions, unclear system
behavior, and failing checks.

Expected contribution:

- establishes reproduction and evidence before fixes
- separates diagnosis from implementation
- feeds confirmed fixes back into change/runtime workflows

### /build-architecture

Periodic architecture governance based on real implementation friction.

Expected contribution:

- identifies module, boundary, test, and dependency problems
- proposes refactors through decisions and changes
- avoids speculative architecture disconnected from actual work

## Directory Direction

OpenWorkflow should eventually define a portable project layout similar to:

```txt
.codex/
  workflow/
    WORKFLOW_INDEX.yaml
    CONTRACT_GRAPH.yaml
  context/
    CONTEXT.md
    CONTEXT_MAP.yaml
    GLOSSARY.yaml
  vision/
    VISION.md
    VISION_CONTRACT.yaml
    archive/
  decisions/
    DECISION_INDEX.yaml
    ADR-0001-example.md
  spec/
    SPEC_INDEX.yaml
    archive/
  changes/
    <change_id>/
      CHANGE.yaml
      SCOPE_LOCK.md
      IMPACT_MAP.md
      ACCEPTANCE.md
      WORK_ITEMS.yaml
      AGENT_BRIEFS/
      archive/
  runtime/
    RUNTIME_INDEX.yaml
    STATE_MACHINE.md
    scopes/
    archive/
```

The exact layout may evolve, but the principle should not: every runtime action
must be traceable to an upstream contract.

## Design Principles

- Contract first: write stable files before launching long-running execution.
- Repo local: the project should be recoverable without chat history.
- Progressive disclosure: skills should load only the contract layer they need.
- Single responsibility: each skill should own one workflow transition.
- Evidence before execution: prototypes and diagnosis should produce evidence,
  not merely opinions.
- Delegation with memory: persistent agents should carry domain memory across
  related tasks; event agents should remain narrow and disposable.
- Runtime is truth for execution only: runtime should not replace vision,
  context, decisions, specs, or change contracts.

## Immediate Next Step

Before implementing individual skills, define the shared OpenWorkflow file
schema and contract graph:

```txt
workflow -> context -> vision -> decisions -> spec -> change -> slices -> team -> runtime
```

This keeps future `build-*` commands interoperable instead of becoming a set of
unrelated helper skills.
