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

The engine behind strategic prompt generation is a co-founder plus senior
product-manager perspective: interpret the vision with product judgment, design
philosophy, and willingness to imagine materially different product forms. The
references are tools for that perspective, not a checklist whose completion
alone proves quality.

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
- `skills/build-prototype/references/vision2prompt/01_input_contract.md`
  through `skills/build-prototype/references/vision2prompt/07_quality_rubric.md`

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
   `skills/build-prototype/references/strategic-prompt-pack-protocol.md`
   and run the `references/vision2prompt/` files in numeric order before
   marking prompt text ready for image generation.
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
4. Adopt the perspective engine before generating directions: act as a
   co-founder and 15-year senior product manager who asks what product should
   exist, why this prototype matters, what user transformation it should create,
   and what form best expresses the vision.
5. Represent the strategic core as target user plus behavior change plus
   mechanism plus differentiator plus boundary conditions.
6. Infer the product experience model before directions: product archetype,
   primary canvas, information architecture, domain objects, task loop,
   interaction states, data realism, visual language, and anti-generic
   constraints.
7. Decide whether source concepts are distinct product forms or modules,
   scenarios, layers, workflows, or states inside one product shell.
8. Generate 5-8 candidate strategic hypotheses.
9. Select the requested number of directions, defaulting to 3.
10. Write each direction as a concrete high-fidelity prototype prompt with
   `screen_prompts` tied to `screen_manifest.target_screen_id` values.
11. Set `prompt_text_manifest.status: ready_for_image_generation` only after
    `prompt_pack_integrity_gate.status`, `prototype_reality_gate.status`, and
    `quality_rubric.prompt_executability.status` are `pass`, and after
    `prompt_text_manifest.paragraph_quality_status` confirms dailin-grade
    prompt paragraph quality.
12. Keep `image_generation.status: not_started` and repair through
    `/ow:vision2prompt` when integrity, reality, executability, or
    post-validation gates are missing or failing.
13. Recommend the first direction to generate based on risk reduction,
   observability, feasibility, and closeness to the success signal.
14. Record review evidence and next action guidance.

## Strategic Direction Rules

- Directions must differ by product form, initiation trigger, interaction
  model, emotional driver, retention mechanism, validation metric, or main
  risk.
- Every direction must include a product thesis, target user transformation,
  reason-to-exist, and explicit PM judgment about why this form deserves a
  prototype.
- Source scenarios, modules, layers, workflows, and interaction states are not
  strategic directions by themselves; keep them inside one product shell unless
  they imply materially different product forms or product loops.
- Do not create variants that differ only by visual style.
- Preserve explicit non-goals, trust boundaries, privacy requirements, and user
  controls.
- Convert category anti-patterns into negative constraints, especially generic
  AI dashboards, consulting-report screens, or card walls when the product
  category calls for a richer operational shell.
- Prompts must specify screens, journeys, interactions, states, AI/system
  behavior, trust controls, privacy boundaries, visual direction, anti-goals,
  desired user feeling, and concrete sample content.
- The prompt text itself must pass paragraph quality; adjacent YAML fields do
  not rescue a terse `screen_prompts[].prompt`.
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
