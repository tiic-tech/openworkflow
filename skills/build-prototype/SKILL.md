---
name: build-prototype
description: Compile proto-ready vision and durable validation targets into image-first strategic prototype prompt packs. Use when /ow:proto needs to generate high-quality prompt directions for design/image tools before tune, proto2html, specs, changes, Agent Teams, runtime state, or production implementation plans.
---

# Build Prototype

## Purpose

Compile prototype discovery artifacts without starting production
implementation. The preferred source behavior is image-first: consume durable
validation plus proto-ready vision, extract the product strategy, and turn that
strategy into strategic prototype prompt packs that can be reviewed, generated,
tuned, or handed off.

Prototype work answers a product uncertainty. It should not become a hidden
production implementation plan.

`/ow:proto` is a strategy-to-prompt compiler. It should not merely describe a
screen or create visual variants. Its job is to preserve the product intent
from vision and validation, create strategically distinct prototype directions,
and write prompts concrete enough for high-quality image prototype generation.

## Inputs

Required:

- `.openworkflow/vision/VISION_CONTRACT.yaml`, `.openworkflow/vision/VISION.md`,
  or direct user vision
- `.openworkflow/validation/<validation_id>/VALIDATION.yaml`

If a current validation artifact is missing but a vision exists, `/ow:proto`
must first trigger the same artifact-producing `/ow:validation` pass and write
durable validation artifacts before prototype prompt generation. Do not proceed
with ephemeral `vision_only` context.

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

1. Choose the source mode:
   - `strategic` when the input is durable validation plus vision context
   - `local_runnable` only when the user asks to execute a prototype or the
     validation question requires interaction
2. Load the mode-specific inputs.
3. For `strategic` mode, use
   `skills/build-prototype/references/strategic-prompt-pack-protocol.md`.
4. If the user asks to tune accepted baseline screens or an accepted prompt
   pack, hand off to `skills/tune-prototype/SKILL.md`.
5. Run `npm run validate` when the repository validator exists.

## Strategic Workflow

1. Load the vision or validation inputs.
2. Apply the validation consumption policy:
   - if validation is absent, run artifact-producing validation first
   - if validation exists, consume it and preserve its include/exclude boundaries
   - if validation conflicts with vision, stop for a decision instead of
     widening the prototype scope
3. Extract the normalized strategy: product domain, primary user, usage
   context, current alternative, core pain, desired behavior change, success
   signal, differentiator, emotional value, functional value, trust and privacy
   requirements, non-goals, future opportunities, and validation target.
4. Represent the strategic core as target user plus behavior change plus
   mechanism plus differentiator plus boundary conditions.
5. Generate 5-8 candidate strategic hypotheses.
6. Select the requested number of directions, defaulting to 3.
7. Write each direction as a concrete high-fidelity prototype prompt.
8. Recommend the first direction to generate based on risk reduction,
   observability, feasibility, and closeness to the success signal.
9. Record review evidence and next action guidance.

## Strategic Direction Rules

- Directions must differ by product form, initiation trigger, interaction
  model, emotional driver, retention mechanism, validation metric, or main
  risk.
- Do not create variants that differ only by visual style.
- Preserve explicit non-goals, trust boundaries, privacy requirements, and user
  controls.
- Prompts must specify screens, journeys, interactions, states, AI/system
  behavior, trust controls, privacy boundaries, visual direction, anti-goals,
  desired user feeling, and concrete sample content.
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
- Do not skip durable `/ow:validation` when validation is missing.
- Do not tune accepted baseline screens here; use `tune-prototype`.

## Handoff

After user review, hand off to `/ow:decision`, `/ow:tune`, design/spec
planning, or another candidate change.

Expected outcomes:

- `continue`: prototype direction is strong enough for production planning
- `tune`: generate a refined prompt pack from the accepted baseline
- `pivot`: adjust the vision or validation target
- `stop`: archive or clean the prototype path
- `needs_more_evidence`: revise the prompt pack or build a smaller local test
