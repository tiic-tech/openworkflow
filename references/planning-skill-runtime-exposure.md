# Planning Skill Runtime Exposure Boundary

This reference defines the accepted design-only boundary for exposing planning
skills such as `decompose-to-changes`, `analyze-changes`, and `select-change`
through OpenWorkflow runtime and generated adapter surfaces.

It implements the approved `C004` Option B path. It does not authorize runtime
registry, artifact registry, adapter generation, or generated-surface changes.

## Purpose

Planning skills are currently repo-local dogfood skills. They operate on
durable planning artifacts under `changes/<plan_id>/` and are useful before the
formal `.openworkflow` spec/change/team chain is fully instantiated.

Runtime exposure is valuable only if it preserves three boundaries:

- source skills remain implementation-independent planning behavior;
- core owns semantic workflow and artifact contracts;
- adapters own platform-specific delivery and generated files.

## Authority Boundaries

### Core Semantic Registry

Core may define semantic command or capability names, command scope, allowed
outputs, forbidden outputs, handoff behavior, and artifact contract metadata.

Core must not contain Codex-specific paths, frontmatter rules, generated file
names, or skill invocation syntax.

### Artifact Contracts

Artifact contracts may define source-of-truth files, required fields, summary
policies, current pointers, and read-order expectations.

Planning artifacts must stay summary-first. Default low-context read models
should consume `SUMMARY.yaml`, current slices, or compact indexes before full
candidate queues.

### Adapter Delivery

Adapters own generated skill files, platform metadata, frontmatter, file layout,
manifest entries, and drift checks for their platform.

The Codex adapter may generate `.agents/skills/ow-*` surfaces only from source
registries and templates. Generated files must not be hand-edited to prove a
behavior change.

### Generated Surfaces

Generated `.agents/**`, `.openworkflow/**`, and managed `AGENTS.md` sections are
outputs. Product behavior changes must land in source registries, artifact
contracts, templates, validators, or references first, then be regenerated with
`openworkflow sync`.

### Source Skills

Source skills under `skills/` remain the dogfood implementation references
until runtime exposure is accepted. Their behavior can be promoted only through
explicit, validated source contracts.

## Runtime Exposure Invariants

- One source of truth per behavior: source skill, core command, artifact
  contract, and adapter template must not each define competing semantics.
- Runtime exposure must preserve repo-local delivery as the default trust
  model.
- Every new generated surface needs parity or drift validation before it is
  trusted.
- Planning queues are feat boundaries; selected candidates remain commit-sized
  slices.
- Cross-queue analysis is advisory; selection remains inside one owning queue.
- High-risk candidates still require a decision report and explicit approved
  option before implementation.

## Approved Command Semantics

The accepted C010 direction is to promote the planning source skills to formal
OpenWorkflow semantic command ids:

- `/ow:decompose-to-changes`: creates, queries, and maintains one
  `CANDIDATE_CHANGES.yaml` queue under `changes/<plan_id>/`. It owns planning
  decomposition and queue maintenance, but it must not select a candidate or
  implement code.
- `/ow:analyze-changes`: reads one or more candidate queues and writes advisory
  `CHANGE_ANALYSIS.yaml` evidence. It recommends the next plan id and candidate
  id, including high-risk stop recommendations, but it must not mutate queues,
  select candidates, or authorize high-risk implementation.
- `/ow:select-change`: consumes a queue or explicit analysis recommendation and
  writes `SELECTED_CHANGE.yaml`, `ATOM_TASKS.yaml`, and
  `IMPLEMENTATION_BRIEF.md` for one commit-sized candidate. It must re-check
  branch, dirty-tree, dependency, and high-risk gates before selection.

These command ids are core semantic decisions. Core owns the command names,
source-of-truth behavior boundaries, required and forbidden context, output
contracts, and high-risk gates.

The C011 generated-surface follow-up delivers these command ids through Codex
repo-local skills generated from the command registry. Source skills remain the
behavior references for the planning protocols; generated `.agents/skills/ow-*`
surfaces must stay derived from source registries and templates.

## Read-Model Expectations

Planning runtime exposure must not load full planning history by default.

Default read models should prefer:

1. `.openworkflow/CURRENT_STATE.yaml` for active pointers.
2. `SUMMARY.yaml` for each active planning queue.
3. `CHANGE_ANALYSIS.yaml` when a cross-queue decision is being consumed.
4. `SELECTED_CHANGE.yaml` and `ATOM_TASKS.yaml` for the selected candidate.
5. Full `CANDIDATE_CHANGES.yaml` only when selection, queue maintenance, or
   audit requires source truth.

`references/planning-artifact-contracts.md` defines the planning artifact
registration roles and minimum summary fields. Runtime exposure work must
depend on that registration contract before adding command, adapter, or
generated-surface behavior.

## Follow-Up Candidate Split

Future runtime exposure should be split into smaller candidates:

- `C009`: define planning artifact registration and summary/read-model
  contract. Complete when limited to contract/reference design.
- `C010`: add command or capability registry semantics without adapter
  generation. High risk until a specific registry boundary is approved.
- `C011`: add Codex adapter generation for accepted planning surfaces. Complete
  for Codex repo-local delivery of DTC, AC, and SC generated skills.
- `C012`: add runtime-surface and agent e2e verification fixtures. Medium risk
  when it only verifies existing source behavior; high risk if it changes
  generated surfaces.
- `C013`: reassess full `C004` runtime exposure after the smaller candidates
  prove boundaries.

## Validation Gates

Every follow-up must run:

- `npm run validate`
- `git diff --check`

Runtime or generated-surface follow-ups must also run:

- `node dist/cli/src/index.js sync --root . --tools codex --json`
- `node dist/cli/src/index.js doctor --root . --tools codex --json`
- `npm run verify:runtime-surface`
- `npm run verify:agent-e2e`

## Non-Goals

- No runtime command registry changes in the design-only boundary.
- No artifact registry changes in the design-only boundary.
- No adapter generation changes in the design-only boundary.
- No generated `.agents/**`, `.openworkflow/**`, or `AGENTS.md` edits in the
  design-only boundary.
- No remote git or GitHub mutation.
