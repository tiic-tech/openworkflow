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

Next recommended candidate: `C005`

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

Status: `ready`

Purpose: promote proven source skills into OpenWorkflow command and adapter
surfaces so future repositories can invoke them consistently.

Owned paths:

- `packages/core/src/commands/registry.ts`
- `packages/core/src/artifacts/registry.ts`
- `packages/adapters/codex/src/`
- `packages/cli/src/dev/verifyRuntimeSurface.ts`
- `packages/cli/src/dev/verifyAgentE2E.ts`
- `changes/M58-planning-skill-runtime-surface/`

Depends on: `C002`, `C003`

Validation:

- `npm run validate`
- `npm run verify:runtime-surface`
- `npm run verify:agent-e2e`

## C005 - Dogfood Planning Skills On /ow:proto Redesign

Status: `ready`

Purpose: use the new planning skills to create and select the implementation
queue for `/ow:proto` image-only redesign.

Owned paths:

- `changes/M59-proto-redesign-planning-dogfood/`

Depends on: `C002`, `C003`

Validation:

- `npm run validate`
- `openworkflow handoff --root . --json`
