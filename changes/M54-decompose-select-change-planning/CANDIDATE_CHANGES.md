# Candidate Changes: Decompose and Select Change Skills

Source of truth: `CANDIDATE_CHANGES.yaml`

This Markdown file is the human-readable view. If it conflicts with the YAML,
the YAML wins.

## Selection Policy

Prefer changes that unlock downstream implementation, have focused owned paths,
clear artifact outputs, clear validation, and low cross-module coupling.

Avoid broad workflow rewrites, unclear acceptance, mixed planning and
implementation, and manual edits to generated `.agents` or `.openworkflow`
surfaces.

Next recommended candidate: `C010` after high-risk approval.

Branch boundary: `codex/m54-decompose-select-change-planning`

Latest completed candidate: `C007`

## C001 - Define Planning Artifact Contracts

Status: `done`

Purpose: establish the artifact shapes, lifecycle states, and update rules that
`decompose-to-changes` and `select-change` will read and write.

Includes:

- `CANDIDATE_CHANGES.yaml`
- `CANDIDATE_CHANGES.md`
- `SELECTED_CHANGE.yaml`
- `ATOM_TASKS.yaml`
- `IMPLEMENTATION_BRIEF.md`
- candidate status transition rules

Excludes:

- source skill implementation
- command registry exposure
- generated Codex adapter surfaces
- `/ow:proto` redesign

Owned paths:

- `schemas/`
- `references/`
- `changes/M55-planning-artifact-contracts/`

Validation:

- `npm run validate`

Why first: both skills depend on the same durable artifact vocabulary.

Completion evidence:

- `changes/M55-planning-artifact-contracts/CHANGE.yaml`
- `schemas/candidate-changes.schema.json`
- `schemas/selected-change.schema.json`
- `schemas/atom-tasks.schema.json`
- `references/planning-artifact-contracts.md`
- `npm run validate`

## C002 - Implement decompose-to-changes Source Skill

Status: `done`

Purpose: add a repo-local source skill that turns user input, current
discussion, or explicit planning source text into a complete candidate change
queue.

Owned paths:

- `skills/decompose-to-changes/`
- `changes/M56-decompose-to-changes-skill/`

Depends on: `C001`

Validation:

- `npm run validate`
- manual dogfood run against the current `/ow:proto` redesign discussion

Completion evidence:

- `skills/decompose-to-changes/SKILL.md`
- `skills/decompose-to-changes/references/decomposition-protocol.md`
- `changes/M56-decompose-to-changes-skill/DOGFOOD_PROTO_REDESIGN_CANDIDATE_CHANGES.yaml`
- `changes/M56-decompose-to-changes-skill/DOGFOOD_PROTO_REDESIGN_SUMMARY.yaml`
- `quick_validate.py skills/decompose-to-changes`
- `npm run validate`

## C003 - Implement select-change Source Skill

Status: `done`

Purpose: add a repo-local source skill that reads `CANDIDATE_CHANGES.yaml`,
selects the best next change, and emits implementation-ready active change
artifacts.

Owned paths:

- `skills/select-change/`
- `changes/M57-select-change-skill/`

Depends on: `C001`, `C002`

Validation:

- `npm run validate`
- manual dogfood selection from a sample `CANDIDATE_CHANGES.yaml`

Completion evidence:

- `skills/select-change/SKILL.md`
- `skills/select-change/references/selection-protocol.md`
- `changes/M57-select-change-skill/DOGFOOD_SELECTED_CHANGE.yaml`
- `changes/M57-select-change-skill/DOGFOOD_ATOM_TASKS.yaml`
- `changes/M57-select-change-skill/DOGFOOD_IMPLEMENTATION_BRIEF.md`
- `changes/M57-select-change-skill/DOGFOOD_UPDATED_CANDIDATE_CHANGES.yaml`
- `quick_validate.py skills/select-change`
- `npm run validate`

## C004 - Expose Planning Skills Through Runtime Surfaces

Status: `done`

Purpose: promote proven source skills into OpenWorkflow command and adapter
surfaces so future repositories can invoke them consistently.

Owned paths:

- `packages/core/src/commands/registry.ts`
- `packages/core/src/artifacts/registry.ts`
- `packages/adapters/codex/src/`
- `packages/cli/src/dev/verifyRuntimeSurface.ts`
- `packages/cli/src/dev/verifyAgentE2E.ts`
- `changes/M58-planning-skill-runtime-surface/`

Depends on: `C002`, `C003`, `C007`

Validation:

- `npm run validate`
- `npm run verify:runtime-surface`
- `npm run verify:agent-e2e`

## C005 - Dogfood Planning Skills On /ow:proto Redesign

Status: `done`

Purpose: use the new planning skills to create and select the implementation
queue for `/ow:proto` image-only redesign.

Owned paths:

- `changes/M59-proto-redesign-planning-dogfood/`

Depends on: `C002`, `C003`

Validation:

- `npm run validate`
- `openworkflow handoff --root . --json`

Completion evidence:

- `changes/M59-proto-redesign-planning-dogfood/CANDIDATE_CHANGES.yaml`
- `changes/M59-proto-redesign-planning-dogfood/SUMMARY.yaml`
- `changes/M60-proto-redesign-artifact-contracts/SELECTED_CHANGE.yaml`
- `changes/M60-proto-redesign-artifact-contracts/ATOM_TASKS.yaml`
- `changes/M60-proto-redesign-artifact-contracts/IMPLEMENTATION_BRIEF.md`
- `npm run validate`
- `node dist/cli/src/index.js handoff --root . --json`

## C006 - Harden Planning Skills With Queue Maintenance Operations

Status: `done`

Purpose: add explicit support for point-to-point candidate queue maintenance so
existing `CANDIDATE_CHANGES` queues can be queried and surgically changed by
stable id with operation-level audit history.

Owned paths:

- `skills/decompose-to-changes/`
- `skills/select-change/`
- `schemas/candidate-changes.schema.json`
- `references/planning-artifact-contracts.md`
- `changes/M62-planning-skill-queue-maintenance/`

Depends on: `C002`, `C003`

Validation:

- `npm run validate`

Completion evidence:

- `skills/decompose-to-changes/SKILL.md`
- `skills/select-change/SKILL.md`
- `schemas/candidate-changes.schema.json`
- `references/planning-artifact-contracts.md`
- `changes/M62-planning-skill-queue-maintenance/CHANGE.yaml`
- `npm run validate`

## C007 - Support Cross-Queue Selection Arbitration

Status: `ready`

Purpose: extend `select-change` source behavior so an agent can make an audited
priority decision when multiple active `CANDIDATE_CHANGES` queues exist, while
preserving the norm that one active queue is preferred.

Owned paths:

- `skills/select-change/`
- `references/planning-artifact-contracts.md`
- `changes/M54-decompose-select-change-planning/C007-cross-queue-selection/`

Depends on: `C003`, `C006`

Validation:

- `npm run validate`
- `quick_validate.py skills/select-change`

Acceptance:

- `select-change` can explicitly arbitrate across multiple queues when asked.
- The skill still states that one active queue is the preferred default.
- Cross-queue decisions record rejected alternatives by plan id and candidate id.
- The `M68/H003` versus `M69/S001` dogfood decision is captured as evidence.

Completion evidence:

- `skills/select-change/SKILL.md`
- `skills/select-change/references/selection-protocol.md`
- `references/planning-artifact-contracts.md`
- `changes/M54-decompose-select-change-planning/C007-cross-queue-selection/DOGFOOD_CROSS_QUEUE_EVIDENCE.md`
- `changes/M54-decompose-select-change-planning/C007-cross-queue-selection/LOCAL_COMMIT_EVIDENCE.yaml`
- `quick_validate.py skills/select-change`
- `npm run validate`
- `git diff --check`

## C004 High-Risk Stop

`C004` is dependency-satisfied after `C007`, but remains high risk because it
would expose planning skills through runtime and generated adapter surfaces.

Decision report: `changes/M54-decompose-select-change-planning/HIGH_RISK_DECISION_REPORT.md`

Recommended option: Option B, design-only boundary first.

Approved option: Option B, design-only boundary first.

## C008 - Design Planning Skill Runtime Exposure Boundary

Status: `done`

Purpose: convert the approved C004 Option B path into a design-only boundary
for later planning skill runtime exposure.

Owned paths:

- `references/planning-skill-runtime-exposure.md`
- `changes/M54-decompose-select-change-planning/C008-runtime-exposure-design/`
- M54 queue and summary artifacts
- `changes/M54-decompose-select-change-planning/HIGH_RISK_DECISION_REPORT.md`

Depends on: `C007`

Validation:

- `npm run validate`
- `git diff --check`

Acceptance:

- Design documents core, artifact, adapter, generated-surface, read-model, and validation boundaries.
- Design preserves repo-local delivery and summary-first context consumption.
- Design splits C004 follow-up work into smaller implementation candidates.
- No runtime registry, artifact registry, adapter generation, or generated-surface files are edited.

Completion evidence:

- `references/planning-skill-runtime-exposure.md`
- `changes/M54-decompose-select-change-planning/C008-runtime-exposure-design/SELECTED_CHANGE.yaml`
- `changes/M54-decompose-select-change-planning/C008-runtime-exposure-design/ATOM_TASKS.yaml`
- `changes/M54-decompose-select-change-planning/C008-runtime-exposure-design/IMPLEMENTATION_BRIEF.md`
- `changes/M54-decompose-select-change-planning/C008-runtime-exposure-design/LOCAL_COMMIT_EVIDENCE.yaml`
- `npm run validate`
- `git diff --check`

## C009 - Define Planning Artifact Registration And Summary Contract

Status: `done`

Purpose: define the contract and validator expectations for registering
planning artifacts in read models without exposing runtime command or adapter
generation changes.

Owned paths:

- `references/planning-skill-runtime-exposure.md`
- `references/planning-artifact-contracts.md`
- `schemas/`
- `changes/M54-decompose-select-change-planning/C009-planning-artifact-registration/`

Depends on: `C008`

Validation:

- `npm run validate`
- `git diff --check`

Acceptance:

- Planning artifact registration contract is explicit and summary-first.
- Candidate queues, change analyses, selected changes, atom tasks, and evidence have clear read-model roles.
- Runtime command and adapter generation remain out of scope.
- Future C010/C012 work can use the contract without loading full planning history by default.

Completion evidence:

- `references/planning-artifact-contracts.md`
- `references/planning-skill-runtime-exposure.md`
- `changes/M54-decompose-select-change-planning/C009-planning-artifact-registration/LOCAL_COMMIT_EVIDENCE.yaml`
- `npm run validate`
- `git diff --check`

## C010 - Define Planning Command Or Capability Registry Semantics

Status: `ready`

Risk: `high`

Purpose: decide whether planning skills should become semantic commands,
capability registry entries, or remain source skills before adapter generation.

Stop condition: requires explicit approval before selection.

## C011 - Add Codex Adapter Generation For Accepted Planning Surfaces

Status: `candidate`

Risk: `high`

Purpose: generate accepted planning runtime surfaces through the Codex adapter
only after the semantic registry boundary is approved.

## C012 - Add Planning Artifact Read-Model Verification Fixtures

Status: `done`

Purpose: add verification fixtures for the planning artifact registration
contract without changing runtime command semantics or adapter generation.

Owned paths:

- `packages/cli/src/dev/verifyRuntimeSurface.ts`
- `packages/cli/src/dev/verifyAgentE2E.ts`
- `references/planning-artifact-contracts.md`
- `changes/M54-decompose-select-change-planning/C012-planning-read-model-verification/`

Depends on: `C009`

Validation:

- `npm run validate`
- `npm run verify:runtime-surface`
- `npm run verify:agent-e2e`
- `git diff --check`

Acceptance:

- Verification covers planning artifact summary-first expectations.
- Verification does not add generated surfaces or adapter behavior.
- Full candidate queues are not required for default low-context read models.

Completion evidence:

- `packages/cli/src/dev/verifyRuntimeSurface.ts`
- `packages/cli/src/dev/verifyAgentE2E.ts`
- `changes/M54-decompose-select-change-planning/C012-planning-read-model-verification/LOCAL_COMMIT_EVIDENCE.yaml`
- `npm run validate`
- `npm run verify:runtime-surface`
- `npm run verify:agent-e2e`
- `git diff --check`

## C013 - Reassess Full Planning Skill Runtime Exposure

Status: `candidate`

Risk: `high`

Purpose: reassess C004 after registration, semantic registry, adapter, and
verification boundaries have been proven or blocked.

## Operation Audit

- `OP001`: add `C006`
- `OP002`: select `C006`
- `OP003`: complete `C006`
- `OP004`: add `C007`
- `OP005`: update queue branch boundary to `codex/m54-decompose-select-change-planning`
- `OP006`: select `C007`
- `OP007`: complete `C007`
- `OP008`: query `C004` high-risk stop and create decision report
- `OP009`: add `C008`
- `OP010`: select `C008`
- `OP011`: complete `C008`
- `OP012`: add `C009`
- `OP013`: select `C009`
- `OP014`: complete `C009`
- `OP015`: add `C010`, `C011`, `C012`, and `C013`
- `OP016`: select `C012`
- `OP017`: complete `C012`
