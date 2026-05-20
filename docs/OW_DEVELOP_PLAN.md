# OpenWorkflow Development Plan

This document captures the next product direction for OpenWorkflow from two
angles:

1. Agent-first requirements: what OpenWorkflow must strengthen so an Agent can
   consume, trust, recover, and continue a project with low context.
2. Workflow redesign: the intended product-to-engineering path around
   `/ow:proto`, `/ow:proto2html`, `/ow:html2spec`, `/ow:build`, and `/ow:change`.

It is not a change contract. Use it as the starting brief for the next planning
session.

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
  -> /ow:proto2html
  -> /ow:html2spec
  -> /ow:build
  -> /ow:change
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

## Development Priorities

Recommended next planning sequence:

1. Redefine `/ow:proto` as image-only prototype exploration.
2. Add `/ow:proto2html`.
3. Replace or migrate `/ow:spec` into `/ow:html2spec`.
4. Add `/ow:build`.
5. Rework `/ow:change` as milestone-aware orchestration.
6. Add lifecycle transactions so Agents cannot forget state maintenance.
7. Harden release verification and package-level smoke tests.
8. Formalize multi-platform adapter recovery semantics.

## Open Design Questions

- Should `/ow:proto` support multiple model providers directly, or should it
  only define the artifact contract while the active Agent chooses the image
  generation mechanism?
- Should `/ow:proto2html` require pixel-level comparison, structured visual
  checklist, or both?
- Should `/ow:html2spec` keep backward compatibility with `/ow:spec`, or should
  `/ow:spec` become an alias with deprecation guidance?
- Should lifecycle transactions be a new CLI command, or should each `/ow:*`
  skill call existing CLI commands in a required sequence?
- How should `MILESTONE_SPEC` represent dependencies, parallelizable work, and
  Agent team ownership?
- How should platform fallback work when multiple adapters are supported and
  clean removes all evidence?

## Next Session Starting Point

Start by planning the first concrete change around `/ow:proto` image-only
redefinition.

Before implementation, inspect:

- current command registry
- current artifact contracts for prototype evidence
- generated `ow-proto` skill template
- context packet and command audit generation
- `verify:runtime-surface`
- `verify:agent-e2e`

Do not start by editing HTML generation behavior only. The real change is a
workflow semantics change: `/ow:proto` becomes product-image exploration, and
HTML moves to `/ow:proto2html`.
