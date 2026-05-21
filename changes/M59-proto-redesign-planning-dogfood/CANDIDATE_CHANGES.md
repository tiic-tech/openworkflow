# Candidate Changes: ow:proto Image-First Redesign

Source of truth: `CANDIDATE_CHANGES.yaml`

This Markdown file is the human-readable view. If it conflicts with the YAML,
the YAML wins.

## Selection Policy

Prefer changes that clarify artifact contracts before source behavior, keep
validation consumption explicit, separate first-pass prototype generation from
tuning, avoid runtime exposure before source behavior is proven, and keep owned
paths focused.

Avoid direct generated adapter edits, mixing prompt contract design with CLI
runtime changes, implicit validation removal, and HTML conversion.

Next recommended candidate: `P004`

## P001 - Define Proto Redesign Artifact Contracts

Status: `done`

Purpose: define artifact vocabulary for image-first `/ow:proto`: strategic
prototype prompt packs, screen-bound tune prompt packs, validation input policy,
review evidence, and explicit boundaries before source behavior changes begin.

Owned paths:

- `references/proto-redesign-artifact-contracts.md`
- `schemas/proto-prompt-pack.schema.json`
- `changes/M60-proto-redesign-artifact-contracts/`

Validation:

- `npm run validate`

Selection: `M60-proto-redesign-artifact-contracts`

Completion evidence:

- `references/proto-redesign-artifact-contracts.md`
- `schemas/proto-prompt-pack.schema.json`
- `changes/M60-proto-redesign-artifact-contracts/CHANGE.yaml`
- `npm run validate`

## P002 - Implement Vision-To-Strategic Prototype Source Behavior

Status: `candidate`

Purpose: update source prototype guidance so `/ow:proto` can consume a vision
and produce multiple strategic high-fidelity prototype prompt directions.

Depends on: `P001`, `P004`

## P003 - Implement Prototype Tune To Refined Prompt Source Behavior

Status: `candidate`

Purpose: update tune guidance so a baseline prototype screen group and user
feedback can become screen-bound refined prompt packs without product drift.

Depends on: `P001`, `P002`

## P004 - Clarify Validation Consumption For Proto

Status: `ready`

Purpose: decide and encode how `/ow:proto` should behave when validation
artifacts are present, missing, or internally derived after vision creation.

Depends on: `P001`

## P005 - Dogfood Image-First Proto Flow On OpenWorkflow

Status: `candidate`

Purpose: exercise the redesigned source-level proto flow on OpenWorkflow's own
product vision and record evidence for acceptance, tuning, or pivot.

Depends on: `P002`, `P003`, `P004`

## P006 - Expose Proven Proto Redesign Through Runtime Surfaces

Status: `candidate`

Purpose: promote the proven source-level proto redesign into command, artifact,
and generated Codex adapter surfaces after dogfood evidence is accepted.

Depends on: `P005`
