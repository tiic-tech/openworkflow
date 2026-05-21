---
name: build-prototype
description: Create image-first prototype planning artifacts from a product vision or validation artifacts. Use when the user wants /ow:proto to explore strategic high-fidelity prototype directions, generate prompt packs for design/image tools, or build the smallest local prototype for a core assumption before specs, changes, Agent Teams, runtime state, or production implementation plans.
---

# Build Prototype

## Purpose

Create prototype discovery artifacts without starting production
implementation. The preferred source behavior is image-first: convert a vision
and optional validation context into strategic prototype prompt packs that can
be reviewed, generated, tuned, or handed off.

Prototype work answers a product uncertainty. It should not become a hidden
production implementation plan.

## Inputs

Required, one of:

- `.openworkflow/vision/VISION_CONTRACT.yaml`, `.openworkflow/vision/VISION.md`,
  `.codex/vision/VISION_CONTRACT.yaml`, or direct user vision
- `.codex/validation/<validation_id>/VALIDATION.yaml` plus
  `.codex/validation/<validation_id>/PROTOTYPE_BRIEF.md`

Optional:

- `.openworkflow/context/CONTEXT_MAP.yaml` or `.codex/context/CONTEXT_MAP.yaml`
- direct user constraints about prototype medium, target tool, direction count,
  language, platform, brand, or acceptance bar
- `references/proto-redesign-artifact-contracts.md`
- `skills/build-prototype/references/strategic-prompt-pack-protocol.md`

Do not load unrelated specs, changes, runtime state, reviews, archives, or
implementation history unless the prototype question explicitly depends on
them.

## Output

For image-first planning, write prototype artifacts under the active prototype
or change path chosen by the workflow. The core artifact is a proto prompt pack
matching `schemas/proto-prompt-pack.schema.json`.

Expected prompt-pack files:

```txt
PROTO_PROMPT_PACK.yaml
PROTO_PROMPT_PACK.md
REVIEW_PLAN.md
EVIDENCE.md
```

For local runnable prototypes, the legacy artifact shape remains valid:

```txt
.codex/prototypes/<prototype_id>/
  PROTOTYPE_PLAN.md
  TODO.yaml
  RESULT.md
  EVIDENCE.md
  artifact/
  archive/
```

## Workflow

1. Load the vision or validation inputs.
2. Apply the validation consumption policy:
   - if validation is absent, proceed in `vision_only` mode
   - if validation exists, consume it and preserve its boundaries
   - do not auto-generate validation in this skill
3. Extract the strategic core: target user, behavior change, mechanism,
   differentiator, boundary conditions, and central uncertainty.
4. Generate 5-8 candidate strategic hypotheses.
5. Select the requested number of directions, defaulting to 3.
6. Write each direction as a concrete high-fidelity prototype prompt.
7. Recommend the first direction to generate based on risk reduction,
   observability, feasibility, and closeness to the success signal.
8. Record review evidence and next action guidance.
9. Run `npm run validate` when the repository validator exists.

## Strategic Direction Rules

- Directions must differ by product form, initiation trigger, interaction
  model, emotional driver, retention mechanism, validation metric, or main
  risk.
- Do not create variants that differ only by visual style.
- Preserve explicit non-goals, trust boundaries, privacy requirements, and user
  controls.
- Prompts must specify screens, journeys, interactions, states, AI/system
  behavior, visual direction, anti-goals, and concrete sample content.
- The output is a prompt pack and review plan, not a production spec or task
  backlog.

## Local Prototype Path

Use local runnable prototype behavior only when the user asks to execute a
prototype or when validation requires an interactive artifact. Keep it small:
hardcoded data, single HTML files, local-only assets, mocked LLM output, fake
in-memory persistence, and narrow UI paths are acceptable.

## Forbidden Defaults

- Do not create `SPEC.yaml`, `CHANGE.yaml`, `.codex/runtime/`, or Agent Team
  artifacts from this skill.
- Do not add auth, persistence, deployment, billing, admin, upload, or full AI
  integration unless those are the existential assumption.
- Do not expand the prototype to cover later features.
- Do not treat code completeness as validation success.
- Do not add `/ow:proto2html`.
- Do not remove or auto-trigger `ow:validation`.

## Handoff

After user review, hand off to `/ow:decision`, `/ow:tune`, design/spec
planning, or another candidate change.

Expected outcomes:

- `continue`: prototype direction is strong enough for production planning
- `tune`: generate a refined prompt pack from the accepted baseline
- `pivot`: adjust the vision or validation target
- `stop`: archive or clean the prototype path
- `needs_more_evidence`: revise the prompt pack or build a smaller local test
