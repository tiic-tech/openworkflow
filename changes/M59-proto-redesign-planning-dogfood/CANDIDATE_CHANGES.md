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

Next recommended candidate: `P006`

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

Status: `done`

Purpose: update source prototype guidance so `/ow:proto` can consume a vision
and produce multiple strategic high-fidelity prototype prompt directions.

Depends on: `P001`, `P004`

Completion evidence:

- `skills/build-prototype/SKILL.md`
- `skills/build-prototype/references/strategic-prompt-pack-protocol.md`
- `skills/build-prototype/agents/openai.yaml`
- `changes/M63-proto-vision-to-strategic-prompt-source/CHANGE.yaml`
- `quick_validate.py skills/build-prototype`
- `npm run validate`

## P003 - Implement Prototype Tune To Refined Prompt Source Behavior

Status: `done`

Purpose: update tune guidance so a baseline prototype screen group and user
feedback can become screen-bound refined prompt packs without product drift.

Depends on: `P001`, `P002`

Completion evidence:

- `skills/build-prototype/SKILL.md`
- `skills/build-prototype/references/refined-prompt-pack-protocol.md`
- `skills/build-prototype/agents/openai.yaml`
- `changes/M64-proto-tune-refined-prompt-source/CHANGE.yaml`
- `quick_validate.py skills/build-prototype`
- `npm run validate`

## P004 - Clarify Validation Consumption For Proto

Status: `done`

Purpose: decide and encode how `/ow:proto` should behave when validation
artifacts are present, missing, or internally derived after vision creation.

Depends on: `P001`

Completion evidence:

- `references/proto-redesign-artifact-contracts.md`
- `changes/M61-proto-validation-consumption-policy/VALIDATION_CONSUMPTION_POLICY.yaml`
- `changes/M61-proto-validation-consumption-policy/CHANGE.yaml`
- `npm run validate`

## P005 - Dogfood Image-First Proto Flow On OpenWorkflow

Status: `done`

Purpose: exercise the redesigned source-level proto flow on OpenWorkflow's own
product vision and record evidence for acceptance, tuning, or pivot.

Depends on: `P002`, `P003`, `P004`
Also waits for temporary boundary change: `P007`

Completion evidence:

- `changes/M66-proto-redesign-source-dogfood/PROTO_PROMPT_PACK.yaml`
- `changes/M66-proto-redesign-source-dogfood/PROTO_PROMPT_PACK.md`
- `changes/M66-proto-redesign-source-dogfood/REVIEW_PLAN.md`
- `changes/M66-proto-redesign-source-dogfood/EVIDENCE.md`
- `npm run validate`
- `node dist/cli/src/index.js handoff --root . --json`

## P006 - Expose Proven Proto Redesign Through Runtime Surfaces

Status: `ready`

Purpose: promote the proven source-level proto redesign into command, artifact,
and generated Codex adapter surfaces after dogfood evidence is accepted.

Depends on: `P005`

## P007 - Split Prototype Tuning Into Dedicated Tune-Prototype Skill

Status: `done`

Purpose: separate first-pass strategic prototype generation from
refinement/tuning so `/ow:proto` maps to `build-prototype` and `/ow:tune` maps
to a focused `tune-prototype` source skill before dogfood validates the full
flow.

Depends on: `P003`

Completion evidence:

- `skills/build-prototype/SKILL.md`
- `skills/tune-prototype/SKILL.md`
- `skills/tune-prototype/references/refined-prompt-pack-protocol.md`
- `changes/M65-proto-tune-skill-boundary/CHANGE.yaml`
- `quick_validate.py skills/build-prototype`
- `quick_validate.py skills/tune-prototype`
- `npm run validate`

## Operation Audit

- `OP001`: select `P002`
- `OP002`: complete `P002`
- `OP003`: mark `P003` ready and make it next recommended
- `OP004`: select `P003`
- `OP005`: complete `P003`
- `OP006`: mark `P005` ready and make it next recommended
- `OP007`: add temporary boundary change `P007`
- `OP008`: prioritize `P007` ahead of `P005`
- `OP009`: select `P007`
- `OP010`: complete `P007`
- `OP011`: restore `P005` as next recommended
- `OP012`: select `P005`
- `OP013`: complete `P005`
- `OP014`: mark `P006` ready and make it next recommended
