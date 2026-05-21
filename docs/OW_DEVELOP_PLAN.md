# OpenWorkflow Development Plan

This document captures the next product direction for OpenWorkflow from two
angles:

1. Agent-first requirements: what OpenWorkflow must strengthen so an Agent can
   consume, trust, recover, and continue a project with low context.
2. Workflow redesign: the intended product-to-engineering path around
   `/ow:proto`, `/ow:tune`, `/ow:proto2html`, `/ow:html2spec`, `/ow:build`,
   and `/ow:change`.

It is not a change contract. Use it as the starting brief for the next planning
session.

## Phase Status Update - 2026-05-21

This document is the broad long-term roadmap. The active Phase 2 planning brief
is now `docs/OW_DEVELOP_PLAN_Phase2.md`.

The dogfood cycle after this plan completed several items that were originally
listed as future direction:

| Area | Status | Evidence |
|---|---|---|
| `/ow:proto` image-first redesign | Completed | `changes/M59-proto-redesign-planning-dogfood/` and related proto/tune skill changes |
| `/ow:tune` split from proto | Completed | dedicated `tune-prototype` source behavior and generated `ow-tune` boundary |
| high-risk report governance | Completed | `changes/M70-high-risk-governance-planning/` |
| planning artifact contracts and queue maintenance | Completed | `changes/M54-decompose-select-change-planning/` through `C006` |
| `decompose-to-changes` | Completed and dogfooded | `skills/decompose-to-changes/` |
| `select-change` | Completed and dogfooded | `skills/select-change/` |
| `analyze-changes` | Completed and dogfooded | `skills/analyze-changes/` and `changes/M72-remaining-change-priority-analysis/` |
| local git governance and automation | Completed | `changes/M71-git-version-control-governance/` |
| read-only autonomous simulator | Completed | `M71/G017` |
| remote read-only PR-ready planning | Completed | `M71/G019` |
| disabled-by-default draft PR pilot gate | Completed | `M71/G020` |
| `proto2html` source behavior and dogfood | Partially completed | `changes/M68-post-proto-workflow-planning/H001-H004` |
| `proto2html` runtime exposure | Not completed | `M68/H003`, high-risk report needed |
| `html2spec`, `build`, archive/review/devlog/learn loop | Not completed | moved behind Phase 2 artifact-economy and transaction work |
| lifecycle transactions | Not completed | raised to Phase 2 priority |
| context budget and artifact lifecycle policy | Not completed | raised to Phase 2 priority |

Phase 2 changes the near-term priority. Before adding the full
`html2spec -> build -> review -> archive` chain, OW must protect its core
philosophy: auditable and traceable development with low-context,
high-quality Agent intelligence.

The current recommended next development target is:

```text
M54-decompose-select-change-planning / C007
```

Reason: `C007` makes cross-queue selection arbitration native to
`select-change`, which is now required because multiple active candidate queues
exist. See `changes/M72-remaining-change-priority-analysis/CHANGE_ANALYSIS.yaml`
and `docs/OW_DEVELOP_PLAN_Phase2.md`.

## Current Product Judgment

OpenWorkflow has moved beyond artifact scaffolding. It is becoming a local
workflow control plane for Agents: it tells an Agent what the current project
state is, what can be trusted, what should be read first, which command is next,
what is blocked, and how to recover generated surfaces without damaging user
artifacts.

The recent direction is correct:

- `init` remains minimal and avoids fake stage progress.
- `handoff --json` acts as the Agent trust gate.
- `context --handoff --json` combines bounded context with strict trust checks.
- `SUMMARY.yaml` and current-slice policies reduce raw evidence loading.
- `clean` and `sync` now support non-destructive recovery.
- `verify:agent-e2e` turns first-consumer behavior into a regression suite.

The next phase should not simply add more commands. It should make the whole
product loop more trustworthy, more production-ready, and more faithful to how
real product discovery and implementation work.

## Agent-First Requirements To Strengthen

### 1. Release Trust

OpenWorkflow should be safe to publish and install as a developer tool that
Agents rely on.

Required direction:

- Put Agent-first E2E into the release gate.
- Verify package behavior after `npm pack` or equivalent install flow.
- Ensure `openworkflow --help`, AGENTS.md managed block, command registry,
  artifact contracts, and runtime tests stay synchronized.
- Treat JSON envelope stability as a public contract.
- Avoid publishing if first-consumer recovery, handoff, or context trust gates
  regress.

Why this matters:

An Agent should be able to install the npm package, run `init`, and trust the
published CLI behavior without relying on repository-only fixtures.

### 2. Production-Stage Closure

The discovery side is becoming strong, but the production side needs a complete
closed loop.

Required direction:

- Validate the full path from accepted prototype to HTML, specs, build plan,
  milestone plan, change execution, and team orchestration.
- Make production artifacts high-signal, not placeholder-level.
- Ensure each production-stage command has:
  - required context
  - forbidden context
  - allowed outputs
  - summary policy
  - handoff quality gates
  - verification expectations

Why this matters:

OpenWorkflow should not only help Agents discover a product direction. It
should also help them reduce a large implementation mountain into repeatable,
small, verifiable changes.

### 3. Lifecycle Transactions

The current command set provides the pieces: `draft`, `register`, `summarize`,
`handoff`, `context`, and `check`. The next risk is that Agents may forget one
of the required maintenance steps after producing an artifact.

Required direction:

- Introduce or design a lifecycle transaction mechanism that can atomically
  complete a workflow step.
- A transaction should be able to:
  - register the source artifact
  - update active pointers
  - refresh summaries
  - update `CURRENT_STATE.yaml`
  - set `next_command`
  - validate handoff quality
  - report exact effects in JSON

Why this matters:

The Agent should not need to remember a fragile sequence of maintenance
commands. The workflow should make correct state transitions easy and auditable.

### 4. Multi-Platform Recovery Semantics

Codex is the first priority, but OpenWorkflow should eventually support multiple
Agent platforms such as Codex, Claude Code, OpenCode, and future adapters.

Required direction:

- Design platform detection and recovery as a contract, not ad hoc behavior.
- `sync --json` should explain:
  - configured platforms
  - detected platforms
  - fallback platforms
  - unsupported configured platforms
  - adapter recovery actions
- Clean and sync must preserve source artifacts while recovering managed
  adapter surfaces.
- Default fallback rules must be explicit, especially when clean removes all
  evidence.

Why this matters:

Agents must not see false health. If a platform adapter is missing, stale, or
recovered by fallback, that state must be visible and structured.

## Workflow Redesign

The next major product direction is to reshape the workflow around product
discovery, visual prototyping, HTML reconstruction, spec extraction, build
planning, and incremental execution.

Proposed high-level flow:

```text
/ow:vision
  -> /ow:proto
     -> /ow:decision (internal)
  -> /ow:tune
     -> /ow:decision (internal)
  -> /ow:proto2html
     -> /ow:decision (internal)
  -> /ow:html2spec
     -> /ow:decision (internal)
  -> /ow:build
  -> /ow:change
     -> /ow:decision (internal)
```

### `/ow:proto`: Image-Only Prototype Exploration

The current problem:

`/ow:proto` can enter HTML too early. Once HTML starts, the Agent's attention
shifts toward CSS, layout repair, and implementation details. This can block
deeper product direction exploration.

New definition:

`/ow:proto` should only create high-fidelity static prototype images.

It should not write HTML.

Expected behavior:

- Use image generation or multimodal generation models to explore product
  concepts visually.
- Support multiple candidate images.
- Preserve prompt lineage and design rationale.
- Allow iterative visual exploration before implementation begins.
- Help clarify the product direction through prototype images, not through CSS
  tuning.
- End with an accepted benchmark prototype image.

Potential artifacts:

```text
.openworkflow/prototypes/<id>/
  PROTOTYPE_IMAGE.yaml
  PROMPTS.yaml
  images/
    candidate-01.png
    candidate-02.png
    benchmark.png
  SUMMARY.yaml
```

Important contract:

`/ow:proto` must explicitly forbid HTML output.

### `/ow:tune`: Image Prototype Iteration And Benchmark Selection

Purpose:

Refine the image prototype direction before any HTML reconstruction begins.

`/ow:tune` should stay in the visual exploration phase. It should operate on
prototype images, prompts, critique, user feedback, and design rationale. It
should not become an HTML repair loop.

Expected behavior:

- Start from the current prototype image set or accepted direction.
- Generate refined static image candidates.
- Compare candidates against user feedback, vision, and validation goals.
- Record what changed between iterations and why.
- Preserve prompt lineage and critique history.
- Decide whether the benchmark image is accepted, needs another tune pass, or
  should return to `/ow:proto`.
- Hand off to `/ow:proto2html` only after a benchmark image is accepted.

Potential artifacts:

```text
.openworkflow/prototypes/<id>/
  TUNE_REPORT.yaml
  PROMPTS.yaml
  images/
    tune-01.png
    tune-02.png
    benchmark.png
  SUMMARY.yaml
```

Important contract:

`/ow:tune` should improve or select the benchmark prototype image. It should
not tune HTML. HTML iteration belongs after `/ow:proto2html` and should be
measured by fidelity to the accepted benchmark image.

### `/ow:decision`: Built-In Decision Ledger

Purpose:

Record important decisions as structured artifacts without asking the user or
Agent to manually invoke a separate decision command.

`/ow:decision` existed as a developed capability, but the redesigned workflow
should treat it as an internal built-in mechanism that is automatically
triggered by major workflow steps.

Expected behavior:

- Capture decision points from `/ow:proto`, `/ow:tune`, `/ow:proto2html`,
  `/ow:html2spec`, `/ow:build`, and `/ow:change`.
- Record the decision outcome, alternatives considered, rationale, evidence,
  affected artifacts, and next command.
- Link each produced artifact back to the decision that created or changed it.
- Feed `/ow:learn`, `/ow:devlog`, `/ow:archive`, `/ow:review`, and future
  `/ow:replay`.
- Stay out of the user-facing command flow unless a debugging or replay view is
  needed.

Potential artifacts:

```text
.openworkflow/decisions/<id>/
  DECISION.yaml
  SUMMARY.yaml
```

Important contract:

Users should not have to remember to run `/ow:decision`. Decision capture
should be a default linked behavior of commands that make meaningful product,
design, architecture, milestone, or implementation choices.

### `/ow:proto2html`: Benchmark Image To Single HTML

Purpose:

Take the accepted benchmark prototype image and reconstruct it as a single HTML
prototype with maximum visual fidelity.

Expected behavior:

- Require an accepted benchmark image.
- Generate a single HTML file.
- Compare rendered output against the benchmark image.
- Produce visual fidelity notes and known gaps.
- Use screenshot evidence where possible.

Potential artifacts:

```text
.openworkflow/html-prototypes/<id>/
  HTML_PROTOTYPE.yaml
  prototype.html
  FIDELITY_REPORT.yaml
  screenshots/
  SUMMARY.yaml
```

Important contract:

`/ow:proto2html` is an implementation-reconstruction step, not a product
exploration step.

### `/ow:html2spec`: Locked HTML To Engineering Specs

Purpose:

Replace or evolve the current `/ow:spec` path. The input is a confirmed single
HTML prototype. The output is a set of implementation specs derived from the
HTML and product intent.

Expected outputs:

- `TECH_SPEC`
- `FRONTEND_SPEC`
- `BACKEND_SPEC`
- `API_SPEC`
- `DB_SCHEMA_MODEL`

Expected behavior:

- Distinguish observable facts from inferred architecture.
- Identify product behaviors implied by the HTML.
- Identify backend/API/data needs.
- Identify open questions that cannot be inferred from the HTML.
- Produce specs that are ready for build planning.

Potential artifacts:

```text
.openworkflow/specs/<id>/
  TECH_SPEC.yaml
  FRONTEND_SPEC.yaml
  BACKEND_SPEC.yaml
  API_SPEC.yaml
  DB_SCHEMA_MODEL.yaml
  SUMMARY.yaml
```

Important contract:

Specs should be grounded in the locked HTML prototype, not invented as a
parallel product direction.

### `/ow:build`: Specs To Agent Team And Milestone Plan

Purpose:

Turn the approved spec set into a build structure.

Expected behavior:

- Configure or generate an Agent team.
- Create a `MILESTONE_SPEC`.
- Define workstreams, dependencies, verification gates, and ownership.
- Prepare the project for iterative implementation.
- Do not directly implement product code.

Potential artifacts:

```text
.openworkflow/build/<id>/
  AGENT_TEAM.yaml
  MILESTONE_SPEC.yaml
  BUILD_PLAN.yaml
  SUMMARY.yaml
```

Important contract:

`/ow:build` plans execution. It should not become a hidden implementation step.

### `/ow:change`: Orchestrated Minimal Change Execution

Purpose:

Read `MILESTONE_SPEC`, choose the next smallest valuable change, and execute it
through the configured Agent team.

Expected behavior:

- The main Agent acts as Orchestrator.
- It selects the next minimal change from milestone context.
- It delegates to the configured team when appropriate.
- It records `CHANGE.yaml`, `WORK_ITEMS.yaml`, acceptance, and verification.
- It advances one small piece at a time.
- It repeats until the large milestone is completed.

Important contract:

`/ow:change` should turn a large implementation mountain into many small,
verifiable moves. Each move should be independently understandable,
reviewable, and recoverable.

## Governance And Expression Layer

The redesigned workflow should not stop at implementation. OpenWorkflow should
also govern completed work, continuously review active work, and turn the
development journey into a human-visible creative asset.

These capabilities belong around `/ow:build` and `/ow:change`:

```text
/ow:build
  -> creates AGENT_TEAM and MILESTONE_SPEC

/ow:change
  -> orchestrates one minimal implementation change
  -> internally starts review monitoring

/ow:review
  -> continuously audits git/spec/milestone consistency
  -> emits REVIEW_REPORT

/ow:archive
  -> verifies completed change against MILESTONE_ID
  -> archives only after review passes
  -> emits SUMMARY.yaml

/ow:devlog
  -> turns decisions, artifacts, reviews, and results into a first-person daily article
```

### `/ow:archive`: Change Completion And Milestone Consistency

Purpose:

Archive a completed change only after proving that the change is complete,
reviewed, and consistent with its bound milestone.

This is not a simple move operation. It is an archive transaction.

Expected behavior:

- Every change must carry a `MILESTONE_ID` when created.
- Archive uses the bound milestone id to run a targeted consistency review.
- Archive checks whether:
  - the change acceptance criteria are satisfied
  - required validation was run
  - changed files match the declared scope
  - remaining blockers are explicit or resolved
  - the implementation still matches `MILESTONE_SPEC`
  - review findings are resolved or intentionally deferred
- Archive only succeeds when the review passes.
- Archive generates a `SUMMARY.yaml` for the completed change.
- Archive leaves the active work environment clean before the next change is
  planned.

Potential artifacts:

```text
.openworkflow/archive/<milestone-id>/<change-id>/
  CHANGE.yaml
  WORK_ITEMS.yaml
  ACCEPTANCE.md
  REVIEW_REPORT.yaml
  SUMMARY.yaml
```

Important contract:

`/ow:archive` should protect future planning from half-finished work. If the
current change cannot be proven complete and milestone-consistent, archive
should fail with structured blockers.

### `/ow:devlog`: First-Person Development Narrative

Purpose:

Turn the high-quality artifacts created during OpenWorkflow development into a
daily first-person article that makes the human user's effort visible.

The desired voice is an AI technology blogger documenting daily vibe-coding
practice from the first person. The article should combine technical
explanation, real project decisions, practical details, and visually impressive
outputs.

Expected inputs:

- decisions
- source artifacts
- prototype images
- HTML prototypes
- specs
- change summaries
- review reports
- screenshots
- verification results
- notable conversations and turning points

Expected behavior:

- Trace each artifact back to the decision or change that produced it.
- Explain what was decided, why it mattered, and what changed in the project.
- Include concrete technical details without turning the post into a dry
  changelog.
- Highlight surprising prototype outputs, screenshots, or design artifacts.
- Preserve first-person authorship: the human and Agent are working together,
  and the human's daily effort should become visible.
- Produce an article that can support personal brand building.

Potential artifacts:

```text
.openworkflow/devlog/<date>/
  DEVLOG.yaml
  article.md
  media/
  SUMMARY.yaml
```

Important contract:

`/ow:devlog` should not waste the project's best artifacts. It should transform
the development process into a durable communication asset.

### `/ow:review`: Internal Continuous Review Agent

Purpose:

Provide an internal, non-user-facing review capability that continuously
questions active implementation work.

This command is not meant to be a normal user command. It is an internal
capability started by the system once `/ow:change` enters implementation.

Expected behavior:

- Start an asynchronous review Agent when change execution begins.
- Monitor repository git changes.
- Review the latest diff repeatedly, not only once.
- Check for:
  - code defects
  - spec drift
  - milestone inconsistency
  - missing tests
  - missing verification
  - unintended file ownership changes
  - incomplete acceptance criteria
- Emit `REVIEW_REPORT` for the Orchestrator.
- Feed review findings into the next change context.

Potential artifacts:

```text
.openworkflow/reviews/<change-id>/
  REVIEW_REPORT.yaml
  findings/
  SUMMARY.yaml
```

Important contract:

OpenWorkflow should not trust the first implementation pass. The system should
stay skeptical, continuously review outputs, and provide correction signals to
the Orchestrator.

## Autonomous Change Loop Runtime

If OpenWorkflow should let an Agent autonomously run change after change until
`MILESTONE_SPEC` is complete, it needs more than individual commands. It needs a
deterministic loop runtime.

The goal is not uncontrolled autonomy. The goal is controlled, reviewable,
interruptible autonomy: the Agent can keep selecting, implementing, reviewing,
repairing, verifying, archiving, and advancing small changes until the milestone
is complete or a clear escalation condition is reached.

Proposed high-level loop:

```text
idle
  -> select_change
  -> plan_change
  -> execute_change
  -> review_change
  -> repair_change
  -> verify_change
  -> archive_change
  -> update_milestone
  -> select_change
```

Each loop state should define:

- entry condition
- exit condition
- blocking condition
- repair policy
- generated artifact
- JSON status model

Without this layer, Agents can do useful work but are likely to drift over a
long milestone. With this layer, OpenWorkflow can become a durable Agent
operating system for long-running implementation.

### Milestone Queue

`MILESTONE_SPEC` should not be only a planning document. It should become an
executable queue.

Each milestone work item should define:

- work item id
- dependency graph
- current state: blocked, ready, active, review, archived, done
- owner role
- expected size
- risk level
- verification command
- allowed output artifacts
- owned paths
- current priority
- next recommended change

The Agent should be able to answer, without reading the whole repo:

What is the next smallest valuable change?

### Change Selection Policy

`/ow:change` should not choose work by intuition. It needs a deterministic
selection policy.

Selection should prefer:

- unblockers
- dependency roots
- high-risk validation work
- smallest useful diff
- work with clear owned paths
- work that does not depend on unresolved review findings
- repair changes when tests or review reports are failing

Potential artifact:

```text
.openworkflow/build/<milestone-id>/
  NEXT_CHANGE.yaml
```

`NEXT_CHANGE.yaml` should explain:

- selected work item
- selection rationale
- rejected alternatives
- required context
- owned paths
- verification commands
- expected archive criteria

### Loop State Machine

OpenWorkflow should track the autonomous loop explicitly.

Potential artifact:

```text
.openworkflow/runtime/<milestone-id>/
  LOOP_STATE.yaml
```

`LOOP_STATE.yaml` should record:

- current loop state
- active milestone id
- active change id
- current repair attempt
- max repair attempts
- last successful archive
- current blockers
- next action
- stop condition

This is the machine-readable control surface that lets a new Agent resume an
autonomous run safely.

### Review And Repair Gate

The loop must not trust first output.

Required flow:

```text
implement
  -> review
  -> repair
  -> verify
  -> archive
```

Review and repair should enforce:

- code correctness
- spec consistency
- milestone consistency
- test coverage
- owned path boundaries
- acceptance criteria
- no unplanned scope expansion

Repair should have limits:

- maximum repair attempts
- severity threshold
- escalation after repeated failure
- no widening scope without creating a new change

Potential artifact:

```text
.openworkflow/repairs/<change-id>/
  REPAIR_PLAN.yaml
  REPAIR_REPORT.yaml
  SUMMARY.yaml
```

### Working Tree Discipline

Long-running autonomy requires strict working tree discipline.

Before a change starts:

- worktree should be clean or intentionally checkpointed
- branch/worktree strategy should be explicit
- active change id should be known
- owned paths should be declared

During a change:

- unrelated files should not be modified
- untracked files should be classified
- generated files should be distinguished from source artifacts
- review should detect path ownership violations

Before archive:

- dirty files must be explained
- validation must be complete
- review findings must be resolved or explicitly deferred
- archive should decide whether to commit, tag, or only record metadata

Potential artifact:

```text
.openworkflow/runtime/<milestone-id>/
  WORKTREE_GUARD.yaml
```

### Evidence Ledger

Autonomous execution needs a machine-readable ledger, separate from human
devlogs.

The ledger should answer:

- why this change existed
- what files changed
- which artifacts were produced
- which validations ran
- what review found
- what repairs were made
- why archive passed
- how milestone progress changed

Potential artifact:

```text
.openworkflow/build/<milestone-id>/
  CHANGE_LEDGER.yaml
```

The ledger should be consumed by:

- `/ow:handoff`
- `/ow:archive`
- `/ow:review`
- `/ow:devlog`
- future `/ow:loop`

### Stop And Escalation Policy

Autonomy must know when to stop.

The Agent should escalate when:

- spec ambiguity blocks implementation
- product judgment is required
- tests fail for environmental reasons
- credentials or external services are missing
- review repeatedly fails
- repair attempts exceed the allowed limit
- required changes exceed owned paths
- milestone scope appears wrong
- implementation would require a new architectural decision

Potential artifact:

```text
.openworkflow/runtime/<milestone-id>/
  ESCALATION.yaml
```

`ESCALATION.yaml` should contain:

- reason
- blocking evidence
- attempted fixes
- options for the human
- recommended decision
- safe resume command

### Progress Compression

As milestones grow, the Agent cannot reread all history.

OpenWorkflow should provide compressed progress surfaces:

```text
.openworkflow/build/<milestone-id>/
  MILESTONE_STATE.yaml
  MILESTONE_SUMMARY.yaml
  CHANGE_LEDGER.yaml
  NEXT_CHANGE.yaml
  OPEN_BLOCKERS.yaml
```

These files should let a new Agent answer:

- what is complete?
- what remains?
- what is blocked?
- what should happen next?
- what should be read first?
- what should not be touched?

### Candidate Commands

These are not immediate commitments, but they describe the likely control
surface for autonomous milestone execution.

#### `/ow:loop`

Top-level autonomous change loop runtime.

Potential options:

```text
openworkflow loop --root . --milestone <id> --max-changes <n> --until blocked|complete --json
```

Responsibilities:

- select next change
- start or continue implementation
- invoke review
- invoke repair when needed
- verify
- archive
- update milestone state
- stop on escalation

#### `/ow:select`

Choose the next minimal change from `MILESTONE_SPEC`.

Responsibilities:

- evaluate ready work items
- apply selection policy
- emit `NEXT_CHANGE.yaml`
- explain rationale and rejected alternatives

#### `/ow:guard`

Working tree guard.

Responsibilities:

- check dirty state
- classify untracked files
- validate owned paths
- check active branch/worktree
- prevent archive if the worktree is incoherent

#### `/ow:repair`

Repair loop for review or test failures.

Responsibilities:

- read `REVIEW_REPORT`
- read failing validation output
- produce `REPAIR_PLAN`
- apply minimal repairs
- stop after max attempts
- escalate when scope expands

### Run Policy

Autonomous execution should be governed by a policy file.

Potential artifact:

```text
.openworkflow/runtime/<milestone-id>/
  RUN_POLICY.yaml
```

Policy fields:

- max changes per run
- max repair attempts
- allowed commands
- forbidden commands
- allowed write paths
- required validation commands
- review severity threshold
- archive policy
- commit policy
- escalation policy

Important contract:

The Agent should never be "free running" without a visible policy. Autonomy
must be bounded, inspectable, and resumable.

## Team And Skill Extensibility

OpenWorkflow should ship with built-in Agents and built-in Skills, but it
should not assume that the built-in set is always enough.

During `/ow:build`, the Orchestrator should first compose a team from built-in
Agents and built-in Skills. If the built-in team cannot cover the milestone,
OpenWorkflow should provide explicit commands to create and register new
repo-local Agents or Skills.

These commands should also be available to human users. A user should be able
to manually create an Agent or Skill in the current repo and register it into
the OpenWorkflow runtime so future Orchestrators can discover and use it.

### Built-In Agents And Skills

OpenWorkflow should maintain a curated library of built-in roles and skills.

Potential built-in Agent roles:

- Orchestrator
- Product Strategist
- Prototype Designer
- HTML Reconstruction Engineer
- Frontend Engineer
- Backend Engineer
- API Designer
- Database Modeler
- QA/Verification Engineer
- Reviewer
- Devlog Writer

Potential built-in Skills:

- image prototype generation
- reference pattern extraction
- benchmark image analysis
- decision capture
- HTML fidelity reconstruction
- spec extraction
- milestone decomposition
- code review
- repair planning
- archive audit
- devlog writing

Important contract:

Built-ins should be enough for common workflows, but OpenWorkflow must expose a
first-class extension path when the current task needs a missing capability.

### `/ow:build-agent`: Create And Register Repo-Local Agents

Purpose:

Create a new Agent role when the built-in team cannot satisfy the milestone or
when a human user wants to define a custom project-specific Agent.

Expected behavior:

- Accept a role goal, responsibilities, boundaries, expected inputs, expected
  outputs, and review obligations.
- Generate a repo-local Agent definition.
- Register the Agent into the OpenWorkflow team registry.
- Make the Agent discoverable by `/ow:build`, `/ow:change`, and future loop
  runtime.
- Support both Orchestrator-triggered and human-triggered creation.

Potential artifacts:

```text
.openworkflow/agents/<agent-id>/
  AGENT.yaml
  SUMMARY.yaml

.openworkflow/build/<milestone-id>/
  AGENT_TEAM.yaml
```

Important contract:

`/ow:build-agent` should not create vague personalities. It should create
bounded execution roles with clear responsibilities, allowed scope, expected
outputs, and review requirements.

### `/ow:build-skill`: Create And Register Repo-Local Skills

Purpose:

Create a new Skill when the existing built-in skills do not cover a recurring
project need.

Expected behavior:

- Accept a skill goal, trigger conditions, required context, procedure,
  artifacts, validation, and failure modes.
- Generate a repo-local skill definition.
- Register the Skill into the OpenWorkflow skill registry.
- Make the Skill discoverable by Agents and by `/ow:build`.
- Support both human-triggered and Agent-triggered creation.

Potential artifacts:

```text
.openworkflow/skills/<skill-id>/
  SKILL.yaml
  SUMMARY.yaml
```

If the target platform supports native repo-local skills, OpenWorkflow may also
materialize the Skill into the adapter surface, for example:

```text
.agents/skills/<skill-id>/SKILL.md
```

Important contract:

`/ow:build-skill` should create reusable procedural capability, not one-off
task notes. A Skill should improve future Agent behavior each time the same
kind of problem appears.

### Agent And Skill Registry

OpenWorkflow should provide structured registries so the Orchestrator can
discover available capabilities with low context.

Potential artifacts:

```text
.openworkflow/agents/AGENT_REGISTRY.yaml
.openworkflow/skills/SKILL_REGISTRY.yaml
```

Registry entries should include:

- id
- title
- capability summary
- trigger conditions
- required inputs
- expected outputs
- allowed write scope
- verification responsibility
- platform surfaces
- status: built_in, repo_local, deprecated, needs_review

Why this matters:

Agent team construction should not rely on memory or prose inspection. The
Orchestrator should be able to query a compact registry and decide whether the
available team can execute the milestone.

## Learning Memory

OpenWorkflow should help a project learn from its own artifacts.

As the human and Agents work, the repository accumulates valuable decisions,
mistakes, preferences, constraints, and workflow lessons. These should not stay
buried in old artifacts. The best lessons should be distilled into concise
future-facing guidance.

### `/ow:learn`: Distill Project Lessons Into Agent Guidance

Purpose:

Extract high-value lessons from produced artifacts and update AGENTS.md with
compact guidance that improves future Agent behavior.

Expected inputs:

- decisions
- review reports
- archive summaries
- devlogs
- prototype artifacts
- spec artifacts
- failed changes
- recurring user corrections
- repeated mistakes

Expected behavior:

- Identify durable lessons, not transient task details.
- Distinguish user preference, project constraint, architectural decision,
  recurring mistake, and workflow rule.
- Produce the shortest useful guidance.
- Update AGENTS.md in a clearly managed or append-safe section.
- Avoid bloating AGENTS.md with verbose history.
- Preserve user-authored AGENTS.md content.
- Record where each learned lesson came from.

Potential artifacts:

```text
.openworkflow/learning/<id>/
  LEARNING_REPORT.yaml
  SUMMARY.yaml
```

Potential AGENTS.md section:

```markdown
<!-- BEGIN OPENWORKFLOW LEARNED GUIDANCE -->
...
<!-- END OPENWORKFLOW LEARNED GUIDANCE -->
```

Important contract:

`/ow:learn` should improve future Agent behavior without turning AGENTS.md into
a dumping ground. It should be concise, sourced, and periodically reviewable.

Learning categories:

- user working style
- product decisions
- architecture decisions
- mistakes to avoid
- verification expectations
- design taste
- communication preferences
- repository-specific constraints

Why this matters:

OpenWorkflow should not merely execute tasks. It should help the project and
its Agents get smarter over time.

## Information Architecture And Artifact Economy

OpenWorkflow's core value is not merely that it creates artifacts. Its core
value is that an Agent can obtain high-quality development intelligence from a
small amount of context.

As OpenWorkflow grows, it must avoid becoming an artifact swamp. More commands,
decisions, reviews, images, specs, ledgers, and devlogs can easily make the
system harder to consume. The product needs an explicit information economy:
what is active, what is summarized, what is archived, what is read by default,
and what is only loaded during debugging or dispute.

### Context Budget Contracts

Every command should declare a context budget.

The budget should define:

- maximum default startup bytes
- must-read artifacts
- summary-first artifacts
- full-read artifacts
- forbidden-by-default artifacts
- raw evidence access rules
- escalation conditions for reading more context

Example policy:

```yaml
context_budget:
  default_max_bytes: 12000
  must_read:
    - .openworkflow/CURRENT_STATE.yaml
    - .openworkflow/build/<milestone-id>/NEXT_CHANGE.yaml
  summary_first:
    - .openworkflow/**/SUMMARY.yaml
  full_read_only_if:
    - summary_missing
    - summary_stale
    - review_dispute
    - blocker_requires_evidence
  forbidden_by_default:
    - .openworkflow/**/raw/**
    - .openworkflow/**/screenshots/**
```

Important contract:

Context budget should be part of the command contract. It should not rely only
on prose in generated skills.

### Information Hierarchy

OpenWorkflow artifacts should be organized by consumption level.

```text
L0: current control surface
    CURRENT_STATE.yaml
    handoff JSON
    NEXT_CHANGE.yaml
    OPEN_BLOCKERS.yaml

L1: active summaries
    MILESTONE_SUMMARY.yaml
    active CHANGE SUMMARY.yaml
    quality_summary
    REVIEW_REPORT summary

L2: source artifacts
    validation targets
    prototype image records
    HTML prototype records
    specs
    change contracts

L3: raw evidence
    screenshots
    generated images
    review detail files
    logs
    browser traces

L4: historical archive
    archived changes
    old decisions
    compacted reviews
    completed milestone records
```

Default Agent entry should read L0 and L1. L2 should be read only when the
active command requires it. L3 and L4 should be loaded only for debugging,
audit, replay, or user-facing narrative generation.

### Artifact Lifecycle And Compaction

Artifacts should not remain equally active forever.

Recommended lifecycle states:

- draft
- active
- reviewed
- accepted
- superseded
- archived
- compacted
- obsolete

When an artifact leaves the active path, OpenWorkflow should keep its source
available but reduce its context weight.

Archive or compaction should preserve:

- final outcome
- summary
- linked decisions
- verification result
- affected paths
- blockers or deferred risks
- source artifact path

Compacted artifacts should not appear in default context packets unless the
current command explicitly requires historical evidence.

### Artifact Hygiene Rules

Every artifact type should have a hygiene policy.

The policy should define:

- when it can be created
- which command owns it
- who can update it
- when it must be summarized
- when it becomes superseded
- when it should be archived
- whether it enters default context
- maximum summary length
- attachment policy
- source-link policy

Why this matters:

Without artifact hygiene, every workflow step can create permanent active
files. That eventually destroys low-context consumption.

### Anti-Bloat Budgets

OpenWorkflow should define budgets for active information.

Potential budgets:

- active decisions per milestone
- active review reports per change
- active prototype image candidates
- maximum summary lines
- maximum context packet bytes
- maximum archive summary lines
- maximum devlog source artifacts
- maximum open blockers shown by default

When a budget is exceeded, OpenWorkflow should require one of:

- select top-k
- compact
- archive
- supersede
- ask for explicit full-context mode

Important contract:

OpenWorkflow should prefer a small, current, high-signal context over a large,
complete, low-signal context.

### Gate Results As Data

Quality gates should be structured artifacts, not only code paths or prose
warnings.

Example:

```yaml
gate_id: handoff.summary_quality
scope: prototype_evidence
severity: blocking
status: failed
evidence:
  - missing prototype_artifact
  - empty verification
next_action: run /ow:tune
```

Gate results should be reusable by:

- `handoff`
- `context --handoff`
- `/ow:review`
- `/ow:archive`
- `/ow:release`
- `/ow:devlog`

Why this matters:

If gates are data, every consumer sees the same reason for trust, failure, or
escalation.

### Context Diff

Agents often do not need the whole state. They need to know what changed.

OpenWorkflow should support diffs scoped by:

- since last archive
- since last handoff
- since last review
- since milestone start
- since last user decision
- since last successful release

Potential artifact:

```text
.openworkflow/runtime/<milestone-id>/
  CONTEXT_DIFF.yaml
```

Context diff should answer:

- what changed?
- which artifacts were added?
- which summaries changed?
- which decisions changed?
- which files changed?
- which blockers opened or closed?
- what should the Agent read now?

### Artifact Index Search

Agents should not need to recursively inspect `.openworkflow`.

OpenWorkflow should maintain structured indexes for:

- artifacts by type
- artifacts by status
- artifacts by decision
- artifacts by milestone
- artifacts by changed path
- artifacts by command
- artifacts by recency
- artifacts by quality status

This gives Agents a fast way to find the relevant artifact without reading the
whole tree.

### Harness Engineering Layer

OpenWorkflow needs a stronger testing harness as capabilities grow.

The harness should include:

- golden consumer projects
- fixture milestones
- fixture artifacts
- failure injection
- clean/sync recovery fixtures
- multi-platform adapter fixtures
- visual prototype fixtures
- package install smoke tests
- publish smoke tests
- long-running loop simulations

The purpose is not only to test that CLI commands run. The purpose is to test
that the Agent consumer path remains low-context and high-signal.

### Operational Vs Narrative Split

`/ow:devlog` can turn operational artifacts into human-facing narrative, but it
must not pollute operational context.

Operational artifacts are for running the project:

- state
- specs
- changes
- reviews
- gates
- ledgers
- archives

Narrative artifacts are for communication and reflection:

- devlog articles
- media bundles
- public summaries
- personal brand outputs

Important contract:

Narrative artifacts may reference operational artifacts, but default operational
context should not load narrative content unless the active command is
`/ow:devlog`, `/ow:learn`, or `/ow:replay`.

## Code Intelligence Layer

OpenWorkflow should eventually understand the repository code graph, not only
the workflow artifact graph.

The existing half-finished `codegraph` project at
`/Users/archy/Projects/StartUp/oh-my-terminator/packages/codegraph` is a strong
candidate for this layer because it was designed around the same principle:
low context, high intelligence for Agents. It models files, directories,
modules, imports, exports, dependency direction, impacted files, related tests,
and architecture layers. That is directly useful for change planning, review,
guarding, archive validation, release risk, incident investigation, and
handoff.

The important product judgment is that OpenWorkflow should not absorb
`codegraph` into core too early. `codegraph` is still unfinished, mostly
TypeScript/JavaScript-oriented, and has its own schema, baseline, CLI, update
strategy, and maintenance surface. The safer direction is:

1. Treat `codegraph` as an external code-intelligence provider first.
2. Define OpenWorkflow-owned contracts for the small summaries Agents consume.
3. Use OW itself later as the workflow harness to finish `codegraph`
   development.
4. Only consider migration into OW core after contracts, performance, language
   support, and directory-scope behavior are proven.

### Candidate Code-Intel Contracts

OpenWorkflow should not expose raw `.codegraph/baseline.json` as the default
Agent context. It should convert codegraph evidence into compact OW artifacts.

Potential artifacts:

```text
.openworkflow/runtime/code-intel/
  CODEGRAPH_STATE.yaml
  SUMMARY.yaml

.openworkflow/reviews/<change-id>/
  IMPACT_REPORT.yaml

.openworkflow/runtime/<milestone-id>/
  WORKTREE_GUARD.yaml
```

Potential context packet field:

```yaml
code_intelligence:
  changed_files: []
  owned_paths: []
  impacted_files: []
  related_tests: []
  high_risk_modules: []
  layer_violations: []
  blast_radius: low
  read_first: []
  warnings: []
```

Important contract:

Agents should consume OW's code-intel summaries by default. Raw codegraph state
is debug evidence, not startup context.

### Integration Points

`/ow:build`:

- infer workstreams from dependency roots, layers, and risk areas
- identify likely verification paths
- flag high-complexity or high-blast-radius modules before milestone planning

`/ow:change` and `/ow:select`:

- choose the next small change with awareness of owned paths, related tests,
  impacted dependents, and blast radius
- include code intelligence in `NEXT_CHANGE.yaml`
- prevent a "small" change from quietly touching a large dependency surface

`/ow:review`:

- compare actual changed files with declared `affected_paths`
- detect missing related tests
- report unexpected impacted files
- treat layer violations as review evidence, not automatically as hard failure

`/ow:guard`:

- classify dirty and untracked files against owned paths
- aggregate file-level codegraph evidence into directory-level policy, because
  directory-owned-path behavior should be owned by OW even if codegraph does
  not fully support directory scope yet

`/ow:archive`:

- require `CHANGE.yaml`, actual git diff, impact report, review report, and
  validation evidence to agree before archive passes

`/ow:handoff`:

- include the smallest useful code-intel snapshot so a new Agent knows which
  files matter without reading the repository

`/ow:incident` and `/ow:release`:

- use impacted files, related tests, dependency direction, and layer health to
  summarize failure or release risk

### CodeGraph As A Dogfood Project

Because `codegraph` is valuable but unfinished, it should become one of the
first serious projects developed through the redesigned OpenWorkflow loop.

Recommended path:

1. Use current OW to create a milestone for finishing codegraph's missing
   product surface.
2. Bind changes to codegraph-specific milestone ids.
3. Use `/ow:change`, `/ow:review`, `/ow:archive`, and future `/ow:loop` to
   complete codegraph incrementally.
4. Feed lessons from that work back into OW's code-intel contracts.

This creates a useful recursion: OW uses codegraph to get better code context,
and OW uses its own change loop to finish codegraph.

### Known Boundaries

The first integration should be deliberately conservative.

Known risks:

- language support is currently strongest for TypeScript and JavaScript
- function-level call graph behavior is not mature enough to drive hard gates
- incremental update performance needs to be measured on real repos
- directory-level scope should be an OW aggregation policy, not assumed native
  codegraph behavior
- layer inference should start as advisory review evidence
- codegraph JSON needs an OW envelope: `ok`, `data`, `warnings`, `errors`,
  `effects`, and `next_actions`
- `.codegraph` state must be classified as cache/generated evidence, not as a
  default source artifact

### First Spike

Before building a durable integration, run a spike against both OpenWorkflow
and the codegraph repo itself:

- `codegraph analyze --json`
- `codegraph scope --json`
- `codegraph impact --json`
- `codegraph layers --json`

The spike should record:

- runtime performance
- baseline size
- output shape
- false positives
- related-test quality
- layer inference quality
- usefulness for `NEXT_CHANGE.yaml`
- usefulness for `IMPACT_REPORT.yaml`

## Capability Exposure Model

OpenWorkflow should not expose every capability the same way.

Some commands are product workflow actions that human users should see and
control. Some capabilities are mainly for the Orchestrator but should remain
inspectable. Some should stay internal runtime services with structured reports
instead of user-facing slash commands. Some are policy surfaces that every
command must obey.

Principle:

- If a capability changes product direction, project memory, release state, or
  team capability, it must be visible to the user and usually require explicit
  confirmation.
- If a capability selects, reviews, repairs, guards, observes, or diagnoses
  work, it can be Agent-first, but its output must be structured, auditable, and
  manually inspectable.
- If a capability runs continuously or measures system behavior, it should be
  modeled as runtime infrastructure or reports rather than a normal workflow
  step.
- If a capability defines permissions or safety boundaries, it should be a
  policy surface, not a slash command.

### User-Facing Workflow Commands

These commands represent explicit product, planning, release, memory, or
creation actions. Human users should be able to invoke them directly and should
understand their effects.

| Capability | Exposure | Primary consumers | Notes |
|---|---|---|---|
| `/ow:proto` | user-facing | user + Agent | Image-only product prototype exploration. |
| `/ow:tune` | user-facing | user + Agent | Iterates prototype images and selects the benchmark direction. |
| `/ow:proto2html` | user-facing | user + Agent | Benchmark image to single HTML reconstruction. |
| `/ow:html2spec` | user-facing | user + Agent | Locked HTML to engineering specs. |
| `/ow:build` | user-facing | user + Orchestrator | Builds team and milestone plan, not code. |
| `/ow:change` | user-facing execution | Orchestrator + user | Executes one minimal change from milestone context. |
| `/ow:release` | user-facing release gate | user + Agent | Checks whether the project is ready to publish or deploy. |
| `/ow:devlog` | user-facing creation | user | Converts daily work into first-person public narrative. |
| `/ow:learn` | user-facing with confirmation | user + Agent | Updates durable Agent guidance; must be reviewable. |
| `/ow:build-agent` | user-facing with confirmation | user + Orchestrator | Creates repo-local Agent roles. |
| `/ow:build-skill` | user-facing with confirmation | user + Orchestrator | Creates repo-local reusable Skills. |

Design expectation:

These commands should appear in help, AGENTS.md guidance, command registry, and
runtime verification once implemented. Commands that mutate durable memory,
team capability, release state, or project direction should support preview and
confirmation flows.

### Orchestrator-Facing Commands With User Visibility

These commands are mostly invoked by the Orchestrator or autonomous loop, but
users should be able to run them manually for diagnosis, explanation, or
advanced control.

| Capability | Exposure | Primary consumers | Notes |
|---|---|---|---|
| `/ow:archive` | semi-open | Orchestrator | Required before a completed change leaves active workspace. |
| `/ow:loop` | advanced user-facing | user starts, Agent runs | Bounded autonomous milestone execution. |
| `/ow:select` | semi-open | Orchestrator | Explains why a change was selected. |
| `/ow:guard` | semi-open diagnostic | Agent + user | Checks worktree, owned paths, dirty state, and safety gates. |
| `/ow:repair` | semi-open | Agent | Repairs review/test failures within scope. |
| `/ow:observe` | semi-open diagnostic | Agent + user | Collects runtime/browser/log/CI/deploy signals. |
| `/ow:incident` | semi-open diagnostic | Agent + user | Investigates failures and can trigger repair. |

Design expectation:

These commands should have strong JSON output, clear `health_errors`, and
read-only or bounded mutation behavior. They do not always need to be in the
primary user onboarding path, but their reports must be easy to inspect.

### Internal Runtime Capabilities

These capabilities should not necessarily be normal user-facing workflow
commands. They are runtime services, internal Agent capabilities, or read-only
reports that other commands consume.

| Capability | Exposure | Primary consumers | Notes |
|---|---|---|---|
| `/ow:review` | internal by default | Review Agent + Orchestrator | Continuous review of git/spec/milestone consistency. |
| `/ow:decision` | internal built-in | workflow commands + Orchestrator | Automatically records structured decision artifacts. |
| `/ow:metric` | report-facing | system + user | Tracks change cycle health and Agent performance. |
| `/ow:replay` | read-only report | user + devlog/learn/debug | Reconstructs how a milestone or decision unfolded. |

Design expectation:

Internal capabilities should still leave structured artifacts. Users may need
read-only commands such as `review-status`, `metrics`, or `replay --json`, but
the default interaction should be through Orchestrator reports.

### Policy Surfaces

Permission and safety controls should not be modeled as workflow steps.

Potential policy artifacts:

```text
.openworkflow/policies/
  PERMISSIONS.yaml
  SECRET_POLICY.yaml
  DESTRUCTIVE_ACTIONS.yaml
```

Policy surfaces should define:

- commands that may run autonomously
- commands that require human confirmation
- allowed write paths
- destructive action rules
- dependency installation rules
- network access rules
- environment/config mutation rules
- secret redaction behavior
- publish/deploy permissions

Design expectation:

All autonomous or semi-autonomous commands should consult policy before acting.
Users must be able to inspect and edit policy, but Agents should not bypass it.

### Operational Trust Capabilities

The following capabilities are not yet fully designed, but they belong in the
exposure model.

#### `/ow:observe`

Collect runtime signals:

- app logs
- browser verification results
- console errors
- network errors
- deployment status
- CI status
- performance signals

Primary role:

Provide evidence for `/ow:review`, `/ow:incident`, `/ow:release`, and
`/ow:repair`.

#### `/ow:incident`

Investigate failures from tests, CI, browser checks, deployments, runtime logs,
or user-visible regressions.

Potential artifact:

```text
.openworkflow/incidents/<id>/
  INCIDENT_REPORT.yaml
  SUMMARY.yaml
```

Primary role:

Determine whether a failure is caused by code, environment, spec drift, flaky
tests, external services, or missing credentials, then route to repair or
escalation.

#### `/ow:release`

Run a release gate that is distinct from normal development handoff.

Release should check:

- milestone completion
- archived changes
- review status
- validation results
- package or deployment smoke tests
- open blockers
- release notes or devlog readiness
- safety policy

Primary role:

Separate "safe to continue development" from "safe to publish or deploy".

#### `/ow:metric`

Track workflow quality over time:

- change cycle time
- review failure rate
- repair attempts
- escaped defects
- summary quality
- milestone burn-down
- handoff success rate
- human interruption points

Primary role:

Help OpenWorkflow improve Agent collaboration instead of only recording
artifacts.

#### `/ow:replay`

Reconstruct a milestone, decision chain, or change history from ledgers,
archives, reviews, and devlogs.

Primary role:

Support debugging, learning, migration, public writing, and project memory.

## Cross-Cutting Requirements For New Commands

Every new or renamed command should update the same surfaces:

- command registry
- artifact contracts
- context packets
- command audit index
- AGENTS.md managed block
- `openworkflow --help`
- summary policies
- readiness checks
- handoff quality checks
- `verify:runtime-surface`
- `verify:agent-e2e`

Each command should define:

- required context
- optional context
- forbidden context
- allowed outputs
- forbidden outputs
- source-of-truth artifacts
- summary/current-slice strategy
- read order
- next command
- verification evidence
- decision capture behavior for meaningful product, design, architecture,
  milestone, or implementation choices
- milestone binding, when the command participates in production execution
- review report contract, when the command can change implementation state
- archive behavior, when the command completes a change
- devlog source policy, when the command creates human-visible artifacts
- loop state behavior, when the command participates in autonomous execution
- guard policy, when the command can modify repository files
- escalation policy, when the command can block or stop the loop
- Agent registry behavior, when the command creates or consumes Agent roles
- Skill registry behavior, when the command creates or consumes reusable
  procedural capability
- AGENTS.md learned-guidance behavior, when the command updates durable Agent
  instructions
- context budget contract and default read level
- artifact lifecycle and compaction policy
- anti-bloat budget, when the command can produce many artifacts or large media
- gate result data model, when the command enforces trust or readiness
- context diff behavior, when the command changes active state
- index/search behavior, when the command creates source artifacts
- code-intelligence behavior, when the command plans, changes, reviews,
  archives, releases, or hands off repository implementation work
- exposure level: user-facing, semi-open Orchestrator command, internal
  runtime, read-only report, or policy surface
- confirmation behavior for commands that mutate durable memory, release state,
  team capability, or user-visible artifacts
- policy checks for autonomous execution, destructive behavior, secrets,
  network access, dependency installation, publish, and deploy

## Development Priorities

Recommended next planning sequence:

1. Redefine `/ow:proto` as image-only prototype exploration.
2. Redefine `/ow:tune` as image prototype iteration and benchmark selection.
3. Reframe `/ow:decision` as an internal built-in decision ledger triggered by
   major workflow commands.
4. Add `/ow:proto2html`.
5. Replace or migrate `/ow:spec` into `/ow:html2spec`.
6. Add `/ow:build`.
7. Rework `/ow:change` as milestone-aware orchestration.
8. Add lifecycle transactions so Agents cannot forget state maintenance.
9. Harden release verification and package-level smoke tests.
10. Formalize multi-platform adapter recovery semantics.
11. Add explicit context budget contracts and artifact lifecycle policies.
12. Add gate results as reusable data and context diff surfaces.
13. Expand harness engineering with golden consumer projects and failure
    injection.
14. Design the code-intelligence adapter contract and run a codegraph spike on
    both OpenWorkflow and the codegraph repo.
15. Add `code_intelligence` to context packets, `NEXT_CHANGE.yaml`, and review
    impact reports after the adapter contract is proven.
16. Add `/ow:review` as an internal continuous review capability for active
   changes.
17. Add `/ow:archive` as the required milestone-consistency gate before a
    completed change leaves the active workspace.
18. Add `/ow:devlog` to turn decisions, artifacts, and outcomes into
    first-person daily development articles.
19. Add executable milestone state and queue semantics.
20. Add deterministic change selection policy.
21. Add loop runtime surfaces for guarded autonomous execution.
22. Add repair and escalation policies.
23. Add built-in Agent and Skill registries.
24. Add `/ow:build-agent` and `/ow:build-skill` for repo-local capability
    extension.
25. Add `/ow:learn` to distill durable project lessons into concise AGENTS.md
    guidance.
26. Define permission and safety policy surfaces.
27. Add operational trust capabilities: `/ow:observe`, `/ow:incident`, and
    `/ow:release`.
28. Add `/ow:metric` and `/ow:replay` as report-oriented capabilities.
29. Use the codegraph repo as a dogfood milestone for the redesigned
    OpenWorkflow change loop, then feed the lessons back into OW's code-intel
    contracts.

## Open Design Questions

- Should `/ow:proto` support multiple model providers directly, or should it
  only define the artifact contract while the active Agent chooses the image
  generation mechanism?
- Should `/ow:tune` generate new image candidates directly, critique existing
  candidates, or support both modes?
- What is the acceptance contract for the benchmark image before
  `/ow:proto2html` can start?
- Which commands must automatically emit decision artifacts, and what decision
  severity is worth recording?
- Should `/ow:decision` have a user-visible read-only report command, or should
  decisions only be consumed through replay, devlog, learn, and archive?
- What default context budget should each command family get?
- Which artifact types should be compacted automatically after archive?
- What anti-bloat budgets should apply to prototype image candidates, review
  reports, decisions, and devlog sources?
- Should gate results become first-class artifacts, or remain embedded in
  command JSON until the model stabilizes?
- How should context diff be computed without making sync or handoff expensive?
- Should `/ow:proto2html` require pixel-level comparison, structured visual
  checklist, or both?
- Should `/ow:html2spec` keep backward compatibility with `/ow:spec`, or should
  `/ow:spec` become an alias with deprecation guidance?
- Should lifecycle transactions be a new CLI command, or should each `/ow:*`
  skill call existing CLI commands in a required sequence?
- How should `MILESTONE_SPEC` represent dependencies, parallelizable work, and
  Agent team ownership?
- What should be the minimal required `MILESTONE_ID` binding in every change
  contract?
- Should `/ow:review` run as a CLI-triggered local process, an Agent team role,
  or an automation heartbeat?
- What severity threshold should block `/ow:archive`?
- How should `/ow:devlog` choose which artifacts are public-safe, visually
  useful, and worth turning into a daily article?
- Should autonomous execution be exposed as `/ow:loop`, or should it remain an
  orchestrator behavior built on `/ow:change`, `/ow:review`, and `/ow:archive`?
- What should be the default max changes and max repair attempts for a safe
  autonomous run?
- Should each archive create a git commit, or should commit policy remain
  configurable per project?
- How should `CHANGE_LEDGER.yaml` stay compact enough for low-context Agent
  consumption while still preserving full traceability?
- What is the boundary between a custom Agent and a custom Skill?
- Which built-in Agents and Skills should ship first?
- Should `/ow:build-agent` and `/ow:build-skill` be user-facing workflow
  commands, CLI commands, or both?
- How should OpenWorkflow prevent low-quality custom Agents or Skills from
  polluting future orchestration?
- How should `/ow:learn` decide whether a lesson is durable enough to enter
  AGENTS.md?
- Should learned guidance be automatically pruned, reviewed, or versioned?
- Which capabilities should be user-facing commands, semi-open Orchestrator
  commands, internal runtime services, read-only reports, or policy surfaces?
- What confirmation model should apply to `/ow:learn`, `/ow:build-agent`,
  `/ow:build-skill`, `/ow:release`, and `/ow:devlog`?
- Should `/ow:observe`, `/ow:incident`, `/ow:metric`, and `/ow:replay` be slash
  commands, CLI commands, generated reports, or all of those?
- What safety policy must be enforced before autonomous loop execution,
  dependency installation, network access, publish, or deploy?
- How should platform fallback work when multiple adapters are supported and
  clean removes all evidence?
- Should code intelligence be implemented as an optional external adapter, an
  OW package, or a future core module after the codegraph spike is complete?
- What is the stable JSON/YAML envelope for code-intel outputs consumed by
  `handoff`, `context`, `change`, `review`, `guard`, `archive`, and `release`?
- How should OW classify `.codegraph` state: generated cache, runtime evidence,
  or user-visible source artifact?
- What minimum language support is required before code intelligence can be a
  default expectation rather than an optional enhancement?
- Which code-intel signals are advisory only, and which are strong enough to
  block review, archive, or release?

## Next Session Starting Point

This section is superseded by the Phase 2 brief.

The previous starting point was `/ow:proto` image-only redefinition. That work
has been completed and dogfooded. The current starting point is:

```text
M54-decompose-select-change-planning / C007
```

Before implementation:

- read `docs/OW_DEVELOP_PLAN_Phase2.md`
- read `changes/M72-remaining-change-priority-analysis/CHANGE_ANALYSIS.yaml`
- reconcile the M54 queue with current branch-boundary governance
- then use `select-change` to select `M54/C007`

Historical note: the original `/ow:proto` guidance below is complete and kept
only as roadmap context, not as the next active task.

Original superseded checklist:

- current command registry
- current artifact contracts for prototype evidence
- generated `ow-proto` skill template
- generated `ow-tune` skill template
- context packet and command audit generation
- `verify:runtime-surface`
- `verify:agent-e2e`

Original outcome: the workflow semantics changed so `/ow:proto` became
product-image exploration and HTML moved to `/ow:proto2html`.
