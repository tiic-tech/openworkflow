# Independent Agent Runtime App Plan

Date: 2026-05-25

Repository: `/Users/archy/Projects/StartUp/openworkflow`

Planning source: design discussion between user and Codex about evolving OpenWorkflow into an independent Agent runtime tool.

## Purpose

This document captures the converged vision for OpenWorkflow as an independent application.

It is intended to be read by future Agents before they design, refactor, or implement any part of OW that touches runtime orchestration, worker roles, candidate changes, selected changes, artifacts, review, git governance, recovery, UI, model/provider adapters, or the eventual standalone app.

After reading this document, an Agent should understand:

- the product vision;
- the soul of the independent tool;
- why OW should exist even if Codex, Claude Code, OpenClaw, or other tools improve;
- what product shape OW should take;
- which architectural decisions are already made;
- what to avoid;
- which UI pages matter first;
- how to phase development;
- how to consume this plan in future implementation work.

## Executive Summary

OpenWorkflow should evolve from a repo-local workflow and artifact system into an independent Agent-native software delivery runtime.

The independent app should not be positioned as another coding chat assistant. Its better product identity is:

> A one-person company operating system for hiring, governing, and coordinating digital workers that turn human intent into auditable delivery.

The human user is the Boss.

Workers are digital employees. They may be manually spawned, assigned souls, granted skills, and placed under clear permissions.

Behind the worker layer, OW runs the governance system:

- Orchestrator;
- Planner;
- Reviewer;
- Git Governor;
- Recovery Engine;
- Alignment Engine;
- Policy Engine;
- Event Store;
- Artifact Store.

The user should not need to understand all runtime machinery. The user should understand:

- which workers are hired;
- what each worker is doing;
- what branch/worktree/task each worker owns;
- what was delivered;
- what risks exist;
- what needs approval;
- whether the result still matches the original intent.

The runtime should handle decomposition, execution, audit, recovery, git governance, and objective alignment.

The final promise:

> Human injects intent. OW designs the vision, organizes digital workers, governs execution, and delivers traceable, recoverable, reviewable outcomes.

## Core Product Thesis

OpenWorkflow should not compete by being "a better Codex clone."

It should compete by owning the runtime layer around any model or coding agent.

Codex, Claude Code, Gemini CLI, OpenClaw, OpenCode, Qwen Code, or future GPT/Claude models can all become executors inside OW.

OW's long-term value is not:

- better autocomplete;
- better chat;
- more prompts;
- more YAML;
- another terminal wrapper.

OW's long-term value is:

- durable state;
- long-task recovery;
- multi-worker governance;
- role-specific execution packets;
- objective alignment;
- review feedback loops;
- git and permission gates;
- auditable event history;
- user-owned runtime artifacts.

## Strategic Differentiation

Large AI coding tools will likely add more orchestration, review, and recovery features. This does not remove OW's opportunity.

OW should differentiate on:

1. **User-owned state**
   - Runtime state, events, artifacts, review results, and git governance live in the user's project or user-owned storage.

2. **Model-agnostic execution**
   - Any LLM or CLI agent can become a provider.
   - Runtime is the center, not the model vendor.

3. **Workflow programmability**
   - Developers can define their own worker roles, policies, skills, gates, and team protocols.

4. **Long-running delivery**
   - Complex tasks can progress over many interruptions, worktrees, selected changes, reviews, and commits.

5. **Governed autonomy**
   - Workers can act, but within explicit permissions and stop gates.

6. **Objective alignment**
   - The original human intent remains a first-class anchor throughout execution.

7. **Auditability**
   - Every significant action can be traced, reviewed, and explained.

This is a different category from a single-session coding assistant.

## Product Soul

The soul of the independent OW tool:

> OW does not make Agents more free. OW makes strong Agents reliable in long-running, multi-step, interruptible, auditable software delivery.

Another formulation:

> OW turns unstable model reasoning into a recoverable, governed engineering process.

And for the end-user product:

> OW lets one person operate a digital software company.

## User Metaphor

The product metaphor should be:

```text
Boss + digital workers + company operating system
```

The Boss:

- injects intent;
- hires digital workers;
- approves high-risk actions;
- reviews delivery;
- redirects strategy when needed.

The Workers:

- have roles;
- have souls;
- have skills;
- have permissions;
- have assignments;
- produce deliverables;
- leave traceable evidence.

OW:

- designs the vision;
- decomposes work;
- assigns tasks;
- controls boundaries;
- runs review;
- manages git;
- recovers after interruption;
- monitors drift;
- turns delivery into auditable outcomes.

## Product Positioning

Recommended product positioning:

> Digital worker operating system for one-person companies.

Alternative positioning:

> Agent-native software delivery runtime.

Short tagline options:

- "Hire digital workers. Govern delivery."
- "One person. A governed AI company."
- "Turn intent into audited delivery."
- "A runtime for digital software teams."

Avoid positioning:

- "AI coding assistant";
- "multi-agent chat";
- "workflow generator";
- "prompt library";
- "YAML task runner";
- "Codex alternative."

## Why Not Just Use Codex Or Claude Code?

Codex and Claude Code are strong worker experiences.

OW should become the operating system around workers.

The independent tool has value if it can provide:

- durable cross-session run state;
- cross-model worker orchestration;
- project-owned event logs;
- worker capability policy;
- objective alignment;
- review scheduling effects;
- git governance;
- recovery from arbitrary interruption;
- UI for delivery review and human approval.

If OW becomes only a weaker coding chat agent, it has no reason to exist.

If OW becomes the runtime that can govern Codex, Claude, local models, and future providers as workers, it has a durable reason to exist.

## Lessons From Golutra

The project `golutra/golutra` was researched as a reference.

Golutra is a Tauri desktop app with Vue/TypeScript frontend and Rust backend. It presents a strong product metaphor:

> Keep your CLI. Orchestrate your AI workforce.

Relevant observed patterns:

- PTY-based terminal runtime using `portable-pty`.
- Desktop app shell with xterm.
- Multiple CLI providers such as Claude Code, Codex CLI, Gemini CLI, OpenCode, Qwen, OpenClaw.
- Durable chat outbox using `redb`, leases, retry, backoff, and dead state.
- Terminal members with status, terminal type, command, unlimited access, and sandboxed flags.
- Chat and mention dispatch to terminal members.
- Workspace-local `.golutra` state.
- Ports-style backend layering.
- Diagnostic logging and passive monitoring.

Key insight for OW:

> Use Golutra's orchestration surface as inspiration, but do not use PTY scraping as OW's core substrate.

PTY compatibility is useful for adoption. It should be an adapter, not the kernel.

OW should define a typed runtime core:

- `Run`;
- `Task`;
- `Worker`;
- `ProviderAdapter`;
- `ToolCall`;
- `Artifact`;
- `Event`;
- `Policy`;
- `Approval`;
- `Checkpoint`;
- `Outbox`;
- `Inbox`;
- `RolePacket`.

## Independent App Architecture

### 1. Runtime Kernel

The kernel owns:

- run state;
- event log;
- role packets;
- task queues;
- worker lifecycle;
- policy evaluation;
- artifact registry;
- recovery;
- objective alignment.

The kernel should be UI-independent.

The desktop app, CLI, local server, IDE extension, and future web dashboard should all be clients of the kernel.

### 2. Model And Provider Layer

Provider types:

- native LLM API worker;
- CLI worker through PTY;
- MCP tool worker;
- local model worker;
- browser/computer-use worker;
- human worker;
- remote worker.

Provider adapter contract should include:

```yaml
provider_adapter:
  id: codex-cli
  kind: pty_cli
  capabilities:
    - code_edit
    - shell
    - git_read
  auth_model: external_cli
  resume_semantics:
    supported: true
    command_template: "codex resume {session_id}"
  sandbox_semantics:
    enforceable: false
    notes: "CLI flag only"
  event_grammar:
    ready: ...
    blocked: ...
    completed: ...
```

Adapters must distinguish real enforcement from metadata.

### 3. Worker Runtime

Workers are digital employees.

A worker has:

- identity;
- visible role;
- soul;
- skills;
- provider/model;
- permissions;
- autonomy level;
- current assignment;
- worktree;
- branch;
- performance history;
- review history;
- trust profile.

Example:

```yaml
worker:
  id: worker_frontend_nora
  name: Nora
  visible_role: Frontend Engineer
  soul:
    identity: pragmatic frontend engineer
    values:
      - correctness
      - restrained UI
      - workflow efficiency
    anti_patterns:
      - broad refactors without need
      - unverified UI changes
  skills:
    - react-ui
    - playwright-verification
    - css-layout
  provider:
    adapter: openai-api
    model: gpt-5.5
  permissions:
    can:
      - edit_frontend_files
      - run_tests
      - take_screenshots
    cannot:
      - push
      - merge
      - edit_backend_validators
  autonomy_level: standard
```

The user edits worker soul and skills. OW compiles those into role packets, permissions, review gates, and validation expectations.

### 4. Orchestration Runtime

The Orchestrator:

- reads the original objective;
- proposes candidate changes;
- selects or schedules selected changes;
- assigns workers;
- monitors progress;
- consumes review results;
- creates corrections;
- asks user for approval when needed.

The Orchestrator should not own all implementation. It controls state transitions.

### 5. Review Runtime

Review must affect scheduling.

Review output should be structured:

```yaml
review_result:
  verdict: pass | needs_fix | blocks_git | creates_followup | requires_user
  findings:
    - severity: P1
      title: ...
      evidence: ...
      required_action: ...
  scheduling_effects:
    blocks_current_sc: true
    creates_followup_cc: false
    downgrades_confidence:
      implementation_correctness: medium
```

Review is not passive commentary. It changes the runtime.

### 6. Git Governance Runtime

Git governance must be strict.

Responsibilities:

- branch ownership;
- worktree ownership;
- dirty state classification;
- local commit evidence;
- PR readiness;
- approval packets;
- merge stop gates;
- rollback notes.

Remote operations require explicit approval:

- push;
- PR creation;
- PR edit;
- issue mutation;
- merge;
- branch deletion;
- release publication.

### 7. Recovery Runtime

Recovery is first-class.

Resume packet should answer:

- last stable state;
- interrupted action;
- incomplete outputs;
- safe-to-continue status;
- why continuation is safe or blocked;
- first action after resume;
- worker/branch/worktree mapping;
- event pointers;
- validation expectations.

Example:

```yaml
resume_reasoning:
  last_stable_state: SC-023 implementation complete
  interrupted_during: review request dispatch
  incomplete_outputs:
    - review_result
  safe_to_continue: true
  why_safe:
    - worker result committed
    - changed paths remain in owned worktree
    - no remote git mutation occurred
  first_action_after_resume: dispatch review request for SC-023
```

### 8. Objective Alignment Runtime

Objective alignment is a first-class runtime component.

It tracks:

- original request;
- success criteria;
- non-goals;
- implemented requirements;
- missing requirements;
- unsupported claims;
- scope creep;
- drift risk;
- correction recommendations.

Example:

```yaml
objective_alignment:
  original_request: ...
  implemented_requirements:
    - ...
  unsupported_requirements:
    - ...
  scope_creep:
    - ...
  drift_risk: medium
  correction_needed: true
```

This is how OW avoids completing many local tasks while drifting away from the user's intent.

## Event/State/API-First Design

OW should not be artifact-first.

Architecture principle:

1. Event log records facts.
2. Current state is a derived read model.
3. Role packets are minimal APIs.
4. Artifacts store evidence, summaries, decisions, and audit material.

### Event Log

Events should be append-only and small:

```yaml
- type: objective_created
- type: candidate_queue_created
- type: selected_change_created
- type: worker_started
- type: worker_result_recorded
- type: review_requested
- type: review_blocked
- type: fix_requested
- type: commit_prepared
- type: approval_required
- type: approval_granted
- type: run_interrupted
- type: run_resumed
```

### Current State

Current state should answer:

- What run is active?
- What is the effective next action?
- Which role should act?
- What is blocked?
- Which worker owns which branch/worktree?
- What can be modified?
- What is forbidden?
- What must be reviewed?
- What needs human approval?

### Role Packet

Each worker receives only the minimal actionable context.

Example:

```yaml
role_packet:
  role: worker
  worker_id: worker_frontend_nora
  assignment: SC-023
  objective_slice: ...
  owned_paths:
    - src/features/runtime/
  forbidden_paths:
    - packages/core/src/validators/
  validation_commands:
    - pnpm test
  stop_if:
    - unexpected file ownership conflict
    - validation command cannot run
  return_contract:
    required:
      - changed_paths
      - validation_results
      - blockers
      - handoff_note
```

## Avoiding YAML Bureaucracy

This vision can fail if OW turns every runtime idea into more heavy YAML that Agents must manually read and write.

Hard rules:

- System complexity is allowed.
- Role interface must stay light.
- Agents write minimal facts.
- OW runtime maintains derived state.
- Heavy evidence is not default context.
- Governance is risk-based.
- Every new field must reduce a concrete decision risk.

Do not create large worker reports by default.

Prefer:

```yaml
worker_result:
  changed_paths: []
  validation_results: []
  blockers: []
  unresolved_risks: []
  handoff_note: ...
```

Let OW derive:

- event log;
- current state;
- summaries;
- dashboard cards;
- audit trail;
- review requests.

## Governance Levels

OW should not force every task into the same process.

Recommended levels:

```yaml
governance_level: light | standard | strict | critical
```

Examples:

- `light`: docs update, low-risk copy change.
- `standard`: regular feature implementation.
- `strict`: shared runtime, validators, security-sensitive code.
- `critical`: git remote mutation, merge approval, release publication.

Governance level controls:

- review depth;
- validation requirements;
- autonomy;
- approval gates;
- evidence requirements;
- recovery checkpoint frequency.

## Product UX Shape

The independent app should not be chat-first.

Chat can exist, but the main product should feel like a command center for a digital company.

If only four pages can be built first, choose:

1. Command Center.
2. Project Run Board.
3. Delivery Review.
4. Worker Fleet.

### Page 1: Command Center

Purpose:

Let the Boss understand overall company health in seconds.

Must answer:

- What active runs exist?
- How many workers are working?
- What is blocked?
- What needs approval?
- What is the highest risk?
- Is objective alignment healthy?
- What will OW do next?

Core modules:

- Active Run.
- Effective Next Action.
- Workers Online.
- Blocked Items.
- Pending Approvals.
- Objective Alignment.
- Delivery Confidence.
- Recent Events.

### Page 2: Project Run Board

Purpose:

Show how a project is being advanced through CC/SC work.

Columns:

- Backlog.
- Ready.
- Selected.
- In Progress.
- In Review.
- Needs Fix.
- Git Ready.
- Waiting Approval.
- Done.

Card fields:

```yaml
card:
  sc_id: SC-023
  title: Build resumable worker packet
  worker: Nora
  branch: ow/runtime-packets
  worktree: /worktrees/sc-023
  risk: high
  validation: 3/4 passed
  review: 1 P1 finding
  alignment: 84%
```

The board should reveal worker, branch, worktree, responsibility, risk, validation, and alignment at a glance.

### Page 3: Delivery Review

Purpose:

Let the Boss inspect actual deliverables, not just Agent claims.

Supported delivery types:

- UI preview;
- screenshots;
- dev server link;
- API response;
- CLI output;
- docs;
- test report;
- diff summary;
- PR readiness packet;
- prototype;
- benchmark.

Actions:

- Accept.
- Request Fix.
- Create Follow-up.
- Reassign.
- Block Git.
- Approve Commit.

This page prevents the system from saying "done" without human-observable delivery.

### Page 4: Worker Fleet

Purpose:

Make digital workers inspectable and governable.

Must answer:

- Who is hired?
- What is their role and soul?
- What skills do they have?
- What are they working on?
- Which branch/worktree do they occupy?
- What permissions do they have?
- How reliable are they?
- Should the Boss pause, retrain, restrict, or reassign them?

Worker card:

```yaml
worker_card:
  name: Nora
  role: Frontend Engineer
  status: Working
  current_sc: SC-023
  branch: ow/runtime-packets
  worktree: /worktrees/sc-023
  model: gpt-5.5
  autonomy: standard
  review_pass_rate: 87%
  risk: medium
```

Worker governance actions:

- Pause worker.
- Reassign task.
- Lower autonomy.
- Require stricter review.
- Edit soul.
- Add skill.
- Revoke permission.
- Spawn similar worker.
- Retire worker.

## User-Visible Worker Design

Workers should be product objects, not hidden model sessions.

Worker profile should include:

- name;
- visible role;
- soul;
- skills;
- model/provider;
- permissions;
- autonomy level;
- current assignment;
- work history;
- delivery history;
- review findings;
- trust level;
- common failure modes.

Important:

Worker soul is not roleplay. It is a user-friendly input that compiles into governed behavior.

Example compilation:

```yaml
soul:
  identity: senior pragmatic frontend engineer
  taste: restrained, polished, utility-first interfaces
  anti_patterns:
    - decorative landing pages
    - broad refactors

compiled_contract:
  allowed_outputs:
    - code_diff
    - validation_result
  default_review:
    required: true
  validation_expectations:
    - browser screenshot
    - mobile layout check
```

## Development Roadmap

### Phase 0: Repair Current Trust Gaps

Goal:

Make current OW trustworthy enough to build on.

Work:

- fix out-of-root mutation risk;
- unify next action signals;
- make blocked handoff fail closed;
- fix preview next actions;
- split validation domains;
- reduce stale guidance in default context.

Exit criteria:

- `handoff`, `inspect`, `context`, and `resume` agree on effective next action.
- Failing trust gates emit only recovery actions.
- Preview commands do not imply files were written.

### Phase 1: Runtime Read Model

Goal:

Introduce shared `RunState` and `EffectiveNextAction`.

Work:

- extract active queue discovery into shared read model;
- define run state schema;
- define event vocabulary;
- make status/handoff/inspect/context/resume consume shared run state;
- introduce role packet concept in read-only form.

Exit criteria:

- a fresh Agent can read one packet and know the correct next action, active worker, active CC/SC, blockers, safe paths, and validation expectations.

### Phase 2: Lightweight Artifact Lifecycle Pilot

Goal:

Prevent future OW from becoming YAML-heavy.

Pilot candidates:

- `/ow:validation`;
- `/ow:change`;
- selected change runtime.

Work:

- add lifecycle states: `stub`, `draft`, `checkpoint`, `handoff_ready`, `accepted`, `archived`;
- split required fields by gate;
- make summaries primary read API;
- make raw evidence conditional;
- add gate validator.

Exit criteria:

- Agent can create a truthful stub.
- Handoff requires decision-critical fields.
- Raw evidence is not default context.

### Phase 3: Single-Agent Managed Loop

Goal:

Run a whole project loop serially before adding parallelism.

Work:

- objective capture;
- CC generation;
- SC selection;
- worker packet;
- worker result;
- review request;
- git evidence;
- recovery packet.

Exit criteria:

- one Agent can advance multiple selected changes across interruptions with structured evidence.

### Phase 4: Role Separation

Goal:

Separate Orchestrator, Worker, Reviewer, and Git Governor contracts.

Work:

- role-specific packets;
- role-specific return contracts;
- review scheduling effects;
- git approval gates;
- alignment checks.

Exit criteria:

- roles can run serially with clean handoffs and no shared context assumptions.

### Phase 5: Independent Runtime Kernel

Goal:

Make OW usable outside Codex as a runtime.

Work:

- model/provider adapter interface;
- worker process lifecycle;
- event log;
- durable outbox/inbox;
- policy engine;
- artifact store;
- local CLI for runtime operations.

Exit criteria:

- at least one native LLM API worker and one PTY CLI worker can execute through the same runtime model.

### Phase 6: Independent App MVP

Goal:

Build the first Boss-facing app.

Pages:

- Command Center;
- Project Run Board;
- Delivery Review;
- Worker Fleet.

Exit criteria:

- Boss can create a project intent, hire/spawn workers, watch execution, review deliverables, approve gated actions, and resume after interruption.

### Phase 7: Async And Parallel Workers

Goal:

Enable real multi-worker execution.

Work:

- dependency-aware scheduling;
- worktree ownership;
- branch conflict detection;
- async review queue;
- concurrent event ingestion;
- merge sequencing.

Exit criteria:

- multiple workers can safely progress independent SCs without path conflicts or state drift.

## MVP Definition

The first independent app MVP should not try to be a full Codex replacement.

MVP should prove:

- user can create an objective;
- OW compiles vision and first work plan;
- user can hire/spawn workers;
- OW creates CC/SC work;
- one worker executes a selected change;
- review runs and produces a scheduling effect;
- delivery is visible in Delivery Review;
- git remains gated;
- run can resume after interruption;
- Command Center explains next action and blockers.

## Non-Goals

Do not:

- build a generic chat app;
- build a low-level terminal multiplexer as the core;
- make every role a roleplay chatbot;
- require users to manage CC/SC/artifacts directly;
- make raw YAML the main UX;
- overfit to Codex-only behavior;
- remove user approval for high-risk remote actions;
- hide delivery behind "Agent says done";
- prioritize parallelism before recovery and governance work.

## Key Decisions Already Made

1. OW should become an Agent Development Runtime, not just a workflow generator.
2. The independent app should use the one-person company metaphor.
3. The human user is the Boss.
4. Workers are visible digital employees.
5. Worker soul is user-facing, but compiled into governed contracts.
6. Orchestrator, Reviewer, Git Governor, Recovery, and Alignment are internal governance layers.
7. Runtime state and event logs should be first-class.
8. PTY CLI compatibility is useful but should not be the runtime core.
9. Summaries and role packets are default Agent APIs.
10. Heavy artifacts and evidence are hidden by default.
11. Review must affect scheduling.
12. Git remote operations require approval gates.
13. Objective alignment is a first-class runtime concern.
14. The first four UI pages are Command Center, Project Run Board, Delivery Review, and Worker Fleet.

## Agent Consumption Guide

Any Agent working on this vision should follow this process:

1. Read this document before proposing implementation.
2. Identify which layer is being changed:
   - runtime kernel;
   - provider adapter;
   - worker runtime;
   - orchestration;
   - artifacts;
   - review;
   - git governance;
   - recovery;
   - alignment;
   - UI.
3. State which key decision this work supports.
4. Keep role interfaces light.
5. Avoid adding YAML fields without a decision-risk reason.
6. Prefer event/state/API-first design.
7. Define the runtime object being introduced or changed.
8. Define how the UI would expose it, if relevant.
9. Define how the run recovers after interruption.
10. Define how review or git governance can block it.

Before implementation, answer:

- Who consumes this?
- What is the minimum packet?
- What event records it?
- What state derives from it?
- What policy gates it?
- What evidence proves it?
- What UI page shows it?
- What user action can override or approve it?

## Acceptance Criteria For Future Work

A future OW change supports this plan if:

- it reduces long-task drift;
- it improves recovery;
- it clarifies worker boundaries;
- it improves objective alignment;
- it makes review schedulable;
- it strengthens git governance;
- it makes delivery more visible;
- it keeps role packets smaller than raw artifacts;
- it preserves model/provider independence;
- it improves user-owned state.

A future OW change conflicts with this plan if:

- it makes the default Agent path heavier;
- it adds raw YAML burden without runtime benefit;
- it hides state in chat history;
- it relies on one model vendor;
- it makes remote mutation easier without gates;
- it treats review as passive commentary;
- it makes user approval less explainable;
- it optimizes chat aesthetics over delivery governance.

## Final Vision

The final product should feel like this:

The Boss opens OW and sees a company dashboard.

Workers are online. Each has a role, soul, task, branch, worktree, and permission boundary.

The Orchestrator is quietly decomposing work into candidate changes and selected changes.

Workers implement in bounded worktrees.

Reviewers audit asynchronously.

The Git Governor prepares commits and approval packets.

The Alignment Engine continuously checks whether the work still serves the original intent.

The Recovery Engine can resume after any interruption.

The Boss reviews actual deliverables, not vague completion claims.

Every important action is traceable, reversible, and explainable.

That is the independent OW app:

> A governed digital software company for one human.
