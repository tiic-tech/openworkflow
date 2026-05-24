# Dogfood Candidate Changes: ow:proto Redesign

Source of truth: `DOGFOOD_PROTO_REDESIGN_CANDIDATE_CHANGES.yaml`

This Markdown file is a dogfood readable view only. The future M59 queue should
be generated again from the live state after `select-change` exists.

Next recommended candidate: `P001`

## P001 - Define Proto Redesign Artifact Contract

Status: `ready`

Purpose: specify how image-first prototype planning consumes vision and optional
validation evidence before changing `ow:proto` behavior.

Owned paths:

- `references/`
- `schemas/`
- `changes/proto-redesign-artifact-contract/`

Validation:

- `npm run validate`

## P002 - Implement Image-First Proto Source Behavior

Status: `candidate`

Purpose: update source prototype guidance so `ow:proto` produces strategic image
prototype prompts and evidence instead of implementation-heavy artifacts.

Depends on: `P001`

## P003 - Decide Validation Consumption Model For Proto

Status: `candidate`

Purpose: resolve whether validation remains user-facing or becomes an internal
artifact automatically derived after vision creation.

Depends on: `P001`

## P004 - Expose Proven Proto Redesign Through Runtime Surfaces

Status: `candidate`

Purpose: promote source-level proto redesign behavior into runtime and generated
adapter surfaces after source behavior is proven.

Depends on: `P002`, `P003`

## P005 - Dogfood Final Proto Redesign On OpenWorkflow Itself

Status: `candidate`

Purpose: use the redesigned proto flow to create image-first prototype evidence
for OpenWorkflow's own development workflow.

Depends on: `P004`
