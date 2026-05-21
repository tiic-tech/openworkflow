# Candidate Changes: Post-Proto Workflow Closure

Source of truth: `CANDIDATE_CHANGES.yaml`

This Markdown file is the human-readable view. If it conflicts with the YAML,
the YAML wins.

## Selection Policy

Prefer artifact contracts before source behavior, source behavior before runtime
command exposure, one workflow boundary per change, HTML reconstruction only
after accepted benchmark prototype evidence, and focused owned paths with
automated validation.

Avoid mixing proto2html with html2spec or build planning, adding commands before
contracts exist, turning proto/tune back into HTML loops, and broad autonomous
runtime changes before production-stage contracts are clear.

Next recommended candidate: `H002`

Feat boundary: this queue owns the top-level `changes/M68-post-proto-workflow-planning/`
folder. Each `H###` candidate is expected to land as a focused commit with
selection artifacts under this feat folder.

## H001 - Define Proto2html Artifact Contracts

Status: `done`

Purpose: define the durable artifact vocabulary for converting an accepted
benchmark prototype image into a single HTML reconstruction with fidelity
evidence.

Owned paths:

- `references/proto2html-artifact-contracts.md`
- `schemas/html-prototype.schema.json`
- `packages/core/src/validators/validateRepositoryContracts.ts`
- `changes/M68-post-proto-workflow-planning/H001-proto2html-artifact-contracts/`

Validation:

- `npm run validate`

Selection: `H001-proto2html-artifact-contracts`

Completion evidence:

- `references/proto2html-artifact-contracts.md`
- `schemas/html-prototype.schema.json`
- `packages/core/src/validators/validateRepositoryContracts.ts`
- `changes/M68-post-proto-workflow-planning/H001-proto2html-artifact-contracts/CHANGE.yaml`
- `npm run validate`

## H002 - Implement Proto2html Source Skill Behavior

Status: `ready`

Depends on: `H001`

Purpose: add source guidance for reconstructing an accepted benchmark image into
a single HTML prototype with fidelity checks and bounded evidence.

## H003 - Expose Proto2html Runtime Command Surface

Status: `candidate`

Depends on: `H002`, `H004`

Purpose: add `/ow:proto2html` to runtime command, artifact, generated adapter,
and verification surfaces after source behavior is defined.

## H004 - Dogfood Proto2html Reconstruction Contract

Status: `candidate`

Depends on: `H001`, `H002`

Purpose: exercise proto2html source behavior on an accepted benchmark-style
prototype input before runtime exposure.

## H005 - Define Html2spec Artifact Contracts

Status: `candidate`

Depends on: `H003`

Purpose: define the contract for deriving engineering specs from a locked HTML
prototype without inventing a parallel product direction.

## H006 - Define Build Milestone Planning Contracts

Status: `candidate`

Depends on: `H005`

Purpose: define how approved specs become a milestone plan, work item queue, and
next-change selection model.

## H007 - Design Lifecycle Transaction Mechanism

Status: `candidate`

Depends on: `H001`

Purpose: design a transaction layer that lets agents complete a workflow step
without forgetting register, pointer, summary, and handoff maintenance.

## Operation Audit

- `OP001`: select `H001`
- `OP002`: complete `H001`
- `OP003`: mark `H002` ready and make it next recommended
