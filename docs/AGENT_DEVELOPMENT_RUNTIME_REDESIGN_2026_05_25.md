# Agent Development Runtime Redesign

Date: 2026-05-25

Repository: `/Users/archy/Projects/StartUp/openworkflow`

Discussion owner: Codex and user

Related documents:

- `docs/AGENT_FIRST_CONSUMER_AUDIT_2026_05_25.md`
- `docs/ARTIFACT_WEIGHT_AND_AGENT_BURDEN_REDESIGN_2026_05_25.md`

## Purpose

This document records the higher-level redesign direction for OpenWorkflow.

The user expectation is that, after a concrete development request is given, Codex can use OW to autonomously complete the full development process:

- Orchestrator creates candidate changes.
- Worker agents select changes and implement them.
- Review agents audit asynchronously.
- Git workers govern branch, commit, PR, approval, and merge boundaries.
- The system advances one candidate change and one selected change at a time.
- The process can recover from arbitrary interruption points.
- Artifacts and runtime state continuously correct drift between the original request and the final delivery.

This document treats that as the long-term product direction.

The key conclusion:

> OW should become an Agent Development Runtime, not a prompt/workflow generator and not a YAML bureaucracy.

## Executive Position

The vision is directionally correct and achievable.

It is correct because complex AI-assisted development does not mainly fail because the Agent cannot write code. It fails because long-running work loses state, drifts from the original objective, mixes responsibilities, lacks clear recovery points, and cannot coordinate multiple workers safely.

It is achievable because the problem can be modeled as bounded state transitions:

- objective capture;
- candidate change decomposition;
- selected change execution;
- review feedback;
- git governance;
- recovery;
- alignment correction.

The major risk is that OW implements this vision by adding more heavy artifacts and more YAML fields. That would recreate the artifact burden identified in the artifact redesign report. The runtime vision must therefore be implemented as event/state/API-first, with light role-specific packets.

## Product Definition

OpenWorkflow should be defined as:

> A runtime and governance layer for AI Agents performing software development over durable state, bounded roles, recoverable execution, structured review, git governance, and continuous objective alignment.

This definition intentionally avoids positioning OW as:

- a prompt collection;
- a static checklist;
- a documentation generator;
- a YAML form system;
- a replacement for model reasoning.

OW should not try to make weak Agents look smart by over-prescribing every thought. OW should let strong Agents act reliably by giving them external state, boundaries, recovery, coordination, and auditability.

## Long-Term Operating Model

The intended autonomous loop:

```text
User objective
  -> Orchestrator creates/updates CC queue
  -> Orchestrator selects next viable CC/SC
  -> Worker creates selected change and implementation brief
  -> Worker implements within owned paths
  -> Worker records validation and evidence
  -> Review agent audits asynchronously
  -> Orchestrator consumes review result
  -> Git worker handles local branch/commit/PR readiness governance
  -> Orchestrator either continues, repairs, creates follow-up, or requests user approval
  -> Repeat until objective is satisfied
```

The process should behave like incremental engineering work, not like one large all-or-nothing Agent attempt.

## Core Roles

### Orchestrator

Responsibilities:

- Convert the original objective into candidate changes.
- Maintain the active run state.
- Decide the effective next action.
- Assign or resume selected changes.
- Consume review and git results.
- Detect objective drift.
- Create correction changes when needed.
- Stop when user approval or clarification is required.

The Orchestrator should not directly perform implementation work except for trivial maintenance. Its main job is scheduling, alignment, and state transition control.

### Worker Agent

Responsibilities:

- Consume a selected change packet.
- Create or update `SELECTED_CHANGE`, `ATOM_TASKS`, and implementation brief surfaces only when needed.
- Modify code only within owned paths.
- Run assigned validation.
- Record minimal implementation evidence.
- Report blockers, unresolved risks, and validation results.

The Worker should receive a small packet, not the whole repository history.

### Review Agent

Responsibilities:

- Audit implementation output against the selected change and original objective slice.
- Identify correctness, risk, regression, security, UX, architecture, and test gaps.
- Emit structured findings.
- Decide whether the change passes, needs fix, blocks git readiness, or creates follow-up work.

Review output must be schedulable. It should not be passive commentary.

### Git Worker

Responsibilities:

- Enforce branch boundary.
- Prepare local commits.
- Record commit evidence.
- Summarize PR readiness.
- Prepare approval packets for remote operations.
- Refuse push, PR creation, merge, or destructive remote mutation without explicit user approval.

Git worker autonomy should be local-first. Remote actions need explicit gates.

## Core Runtime Layers

### Objective Layer

Maintains:

- original user request;
- success criteria;
- non-goals;
- acceptance evidence;
- known risks;
- open questions.

This is the external anchor for all work. It prevents the system from completing many small tasks while drifting away from the original ask.

### Planning Layer

Maintains:

- candidate changes;
- selected changes;
- dependencies;
- risk levels;
- priority;
- parallelization safety;
- next viable candidate.

This layer turns a large objective into commit-sized progress.

### Execution Layer

Maintains:

- selected change packet;
- owned paths;
- forbidden paths;
- atom tasks;
- validation commands;
- worker result;
- implementation evidence.

This layer controls actual code changes.

### Review Layer

Maintains:

- review requests;
- review findings;
- verdicts;
- required fixes;
- follow-up candidates;
- confidence changes.

This layer must feed back into orchestration.

### Git Governance Layer

Maintains:

- branch identity;
- dirty state;
- commit status;
- PR readiness;
- merge approval boundaries;
- rollback notes;
- remote mutation stop gates.

This layer protects the repository.

### Recovery Layer

Maintains:

- current run state;
- last stable state;
- interrupted action;
- incomplete outputs;
- next safe action;
- why recovery is safe or blocked.

This layer makes arbitrary interruption survivable.

### Alignment Layer

Maintains:

- original objective coverage;
- implemented requirement coverage;
- unsupported requirements;
- scope creep;
- drift risk;
- correction recommendations.

This layer keeps the final delivery aligned with the initial request.

## Event/State/API-First Architecture

The runtime should not be artifact-first.

Recommended architecture:

1. Event log records what happened.
2. Current state is derived from events and active artifacts.
3. Role-specific packets expose only the minimum needed information.
4. Heavy artifacts and evidence remain available but are not default context.

### Event Log

Events should be small and append-only.

Example event types:

```yaml
- type: objective_created
- type: candidate_queue_created
- type: selected_change_created
- type: worker_started
- type: worker_completed
- type: validation_failed
- type: review_requested
- type: review_blocked
- type: correction_candidate_created
- type: commit_prepared
- type: approval_required
- type: run_interrupted
- type: run_resumed
```

The event log is the durable explanation of how the system reached its current state.

### Current State

Current state should be compact and derived.

It should answer:

- What is active?
- What is blocked?
- What is the effective next action?
- Which role should act next?
- What packet should that role consume?
- What is safe to write?
- What is forbidden?
- How should progress be verified?

### Role-Specific Packet

Each role should receive a small startup packet.

Example worker packet:

```yaml
role_packet:
  role: worker
  enough_to_start: true
  objective_slice: ...
  selected_change: ...
  owned_paths: []
  forbidden_paths: []
  validation_commands: []
  stop_if: []
  return_contract:
    required:
      - changed_paths
      - validation_results
      - blockers
      - handoff_note
```

The worker should not read all candidate queues, old review reports, raw evidence, or unrelated specs by default.

## Hard Design Constraints

### 1. System Complex, Role Interface Light

The internal runtime may be complex. The Agent packet must be small.

Every role packet should be understandable in minutes and should contain only what the role needs for the next action.

### 2. Agent Writes Minimal Facts

Agents should not hand-maintain large governance YAML files.

Agents should emit minimal structured facts:

```yaml
worker_result:
  changed_paths: []
  validation_results: []
  blockers: []
  unresolved_risks: []
  handoff_note: ...
```

OW should update event logs, state, summaries, dashboards, and audit surfaces.

### 3. Events Are Facts, State Is a View

The event log should be the durable history. Current state should be a derived read model.

This improves recovery, auditing, and conflict resolution.

### 4. Governance Is Risk-Based

Not every task deserves the same ceremony.

Recommended levels:

```yaml
governance_level: light | standard | strict | critical
```

Examples:

- Docs-only edit: light.
- Local UI fix with tests: standard.
- Shared validator or runtime contract change: strict.
- Git remote mutation or merge governance: critical.

### 5. Fail Closed

When trust is blocked, OW should emit only recovery actions as executable next actions.

Normal workflow actions may be listed as deferred, but must not be mixed into ranked immediate next actions.

### 6. Objective Alignment Is First-Class

Every selected change should be traceable to the original objective.

The runtime should continuously ask:

- Which original requirement does this work serve?
- What remains unsupported?
- Is there scope creep?
- Is drift risk increasing?
- Does review require correction?

### 7. Review Must Affect Scheduling

Review output should not be a passive document.

It should have structured scheduling effects:

```yaml
review_effect:
  verdict: pass | needs_fix | blocks_git | creates_followup | requires_user
  blocks_current_change: true
  required_fix: ...
  follow_up_candidate: ...
  confidence_delta:
    implementation_correctness: -0.2
```

### 8. Git Remote Actions Require Explicit Gates

Local branch and commit governance may be automated.

Remote mutation should remain approval-gated:

- push;
- PR creation;
- PR edit;
- issue mutation;
- merge;
- branch deletion;
- release publication.

### 9. Artifacts Need Lifecycle Management

The runtime must distinguish:

- active;
- current;
- stale but non-blocking;
- stale and blocking;
- archived;
- disposable.

Without lifecycle management, OW will become its own context-noise source.

### 10. OW Does Not Replace Model Reasoning

OW should not over-prescribe reasoning steps that strong models can perform.

OW should provide:

- state;
- boundaries;
- recovery;
- coordination;
- validation gates;
- audit trails;
- alignment anchors.

## Avoiding YAML Bureaucracy

The future runtime could easily recreate the artifact-weight problem.

The risk is high because the vision introduces many possible artifact types:

- run state;
- candidate queue;
- selected change;
- worker result;
- review result;
- git evidence;
- objective alignment;
- confidence report;
- recovery packet;
- event log.

The solution is not to avoid structure. The solution is to make structure role-specific and runtime-maintained.

Rules:

- Do not create one large YAML report per role by default.
- Do not require all roles to read all artifacts.
- Do not make Agents manually synchronize derived fields.
- Do not require full audit completeness before useful progress.
- Do not add fields unless they reduce a concrete decision risk.

## Stronger Models and OW's Value

A future model such as GPT-5.6 or GPT-6 may have stronger self-review, planning, and coding ability.

That will reduce the value of:

- long prompt instructions;
- static checklists;
- repeated reminders;
- over-detailed YAML templates;
- hardcoded reasoning procedures.

It will not remove the value of OW if OW is positioned correctly.

Strong models still need:

- durable state;
- multi-agent coordination;
- recovery after interruption;
- external audit history;
- permission boundaries;
- git governance;
- objective alignment anchors;
- team-level development protocols.

Therefore, OW should evolve away from:

> teaching the model how to think

and toward:

> governing how model actions become a recoverable, auditable, coordinated software engineering process.

## Confidence Model

The runtime should eventually expose confidence, not only boolean `ok`.

Example:

```yaml
confidence:
  requirements_understanding: high
  implementation_correctness: medium
  test_coverage: low
  product_alignment: medium
  git_readiness: high
```

Why this matters:

Two green states can have different reliability. A stronger Agent can use confidence to decide whether to proceed, ask for clarification, run more validation, or request review.

## Explainable Recovery

Recovery should not only say what to do next.

It should explain why continuing is safe or unsafe.

Suggested shape:

```yaml
resume_reasoning:
  last_stable_state: ...
  interrupted_during: ...
  incomplete_outputs: []
  safe_to_continue: true
  why_safe:
    - selected change exists
    - no uncommitted code outside owned paths
    - validation plan is still current
  first_action_after_resume: ...
```

This is important for Agent trust after context loss, crashes, tool failures, or branch drift.

## User Transparency

Full delegation should not become a black box.

The user should be able to ask:

- What is OW doing now?
- Why this task now?
- What is complete?
- What remains?
- What is blocked?
- What risks exist?
- Is the implementation still aligned with my original request?
- What needs my approval?

The runtime should be able to generate a concise dashboard from state and events.

## Development Consumption Guide

Future development should consume this document as an architecture constraint.

### Read This Before Changing

Read this document before working on:

- multi-agent orchestration;
- candidate change queues;
- selected change execution;
- worker/review/git role protocols;
- runtime state;
- event logs;
- resume/handoff/inspect/context read models;
- git automation;
- objective alignment;
- artifact lifecycle;
- confidence models;
- long-running autonomous development.

### Required Design Questions

Before implementing a runtime feature, answer:

1. Which role consumes this feature?
2. What is the minimum packet that role needs?
3. Is this event-source fact, derived state, summary, or raw evidence?
4. What is the write contract?
5. What can the Agent do autonomously?
6. What requires user approval?
7. How does this affect objective alignment?
8. How does this recover after interruption?
9. How does review feed back into scheduling?
10. What governance level applies?

### Runtime Feature Acceptance Criteria

A runtime feature is acceptable only when:

- it has a role-specific consumer;
- it reduces decision risk or recovery risk;
- it does not require the Agent to read unrelated artifacts;
- it does not require the Agent to hand-maintain derived state;
- it exposes clear stop conditions;
- it produces parseable structured output;
- it can be resumed after interruption;
- it preserves git and filesystem boundaries;
- it has an E2E or targeted verifier proving the read model works.

### Anti-Patterns

Avoid:

- adding YAML fields because they feel comprehensive;
- creating a new report for every role action;
- making every task use strict governance;
- treating review reports as passive notes;
- letting current state and event history drift;
- mixing recovery actions and normal workflow actions in one ranked list;
- making raw evidence default context;
- using OW to replace model judgment.

## Proposed Roadmap

### Phase 1: Single-Agent Managed Loop

Goal:

Prove one Agent can advance multiple selected changes safely with recovery.

Scope:

- run state;
- effective next action;
- candidate queue;
- selected change packet;
- worker result;
- validation evidence;
- resume packet.

No true parallelism yet.

### Phase 2: Role Separation Without Parallelism

Goal:

Prove role contracts before adding concurrency.

Scope:

- orchestrator role packet;
- worker role packet;
- review role packet;
- git worker role packet;
- structured handoffs;
- review scheduling effects.

Roles may still execute serially.

### Phase 3: Asynchronous Review

Goal:

Allow review to run independently and feed back into orchestration.

Scope:

- review request queue;
- review result schema;
- review scheduling effects;
- confidence updates;
- correction candidate creation.

### Phase 4: Git Governance Runtime

Goal:

Make local git progress safe and remote mutation approval-gated.

Scope:

- branch identity;
- commit evidence;
- PR readiness;
- approval packet;
- stop gates;
- rollback notes.

### Phase 5: Objective Alignment Runtime

Goal:

Continuously minimize drift from original request.

Scope:

- objective coverage;
- unsupported requirements;
- scope creep detection;
- drift risk;
- correction CC creation.

### Phase 6: Parallel Workers

Goal:

Enable safe parallel progress only after role contracts and state model are reliable.

Scope:

- dependency-aware scheduling;
- owned path conflict detection;
- concurrent event ingestion;
- review/gate arbitration;
- merge sequencing.

## Non-Goals

This redesign should not:

- make OW a generic project manager;
- make every development task fully autonomous;
- remove user approval for high-risk remote actions;
- force all tasks into heavy governance;
- require Agents to fill large YAML files manually;
- replace tests, CI, or code review;
- assume stronger models make state and governance unnecessary.

## Final Principle

OW's best future is not to make Agents more free.

OW's best future is to make strong Agents reliable in long-running, multi-step, interruptible, auditable software development.

The durable principle:

> OW does not replace Agent reasoning. OW turns Agent reasoning and action into a recoverable, governed engineering process.
