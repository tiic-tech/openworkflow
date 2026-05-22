---
name: build-prototype
description: Consume ready PROTO_PROMPT_PACK artifacts through prompt2proto and translate them into credible UI/UX prototype instructions and evidence. Use after build-proto-prompt has produced ready prompt text and before tune, proto2html, specs, changes, Agent Teams, runtime state, or production implementation plans.
---

# Build Prototype

## Purpose

Consume ready prototype prompt-pack artifacts without starting production
implementation. The preferred source behavior is image-first: accept a ready
`PROTO_PROMPT_PACK`, verify its readiness and coherence gates, then use
prompt2proto to translate the prompt pack into credible UI/UX prototype
instructions, evidence, and downstream handoff facts.

Prototype work answers a product uncertainty. It should not become a hidden
production implementation plan.

`/ow:proto` remains the user-facing orchestration command. It may run
build-proto-prompt internally when a ready prompt pack is missing, then hand the
ready prompt pack to build-prototype/prompt2proto. `build-prototype` itself is
not the vision-to-prompt-pack compiler.

The engine behind ready prompt-pack compilation belongs to build-proto-prompt:
co-founder plus senior product-manager judgment generates strategically
different prompt directions. Build-prototype starts after that point. Its
engine is Chief PM plus Principal UI/UX judgment that translates the ready
prompt pack into a credible prototype surface.

Before any downstream prompt2proto handoff or visual prototype translation,
switch from prompt-pack strategy generation into the build-prototype philosophy
engine: Chief PM plus Principal UI/UX judgment. The Chief PM protects product
intent, user decision context, domain fit, and evidence value. The Principal
UI/UX lead protects visual hierarchy, density calibration, affordance clarity,
interaction believability, and prototype credibility. This judgment layer
decides what information is visible, grouped, collapsed, delayed, or drilled
into based on industry, user role, task risk, screen size, task frequency, and
reviewer attention.

## Inputs

Required:

- `.openworkflow/prototypes/<prototype_id>/PROTO_PROMPT_PACK.yaml` or an
  equivalent ready prompt pack artifact
- `prompt_text_manifest.status: ready_for_image_generation`
- `prompt_text_manifest.paragraph_quality_status: pass`
- `prompt_pack_integrity_gate.status: pass`
- `prototype_reality_gate.status: pass`
- `quality_rubric.prompt_executability.status: pass`
- `prototype_system_contract` when multiple screens share a product shell
- `post_validate.status: pass` for multi-direction packs, or `skipped` for an
  explicit single-direction pack

If a ready prompt pack is missing, thin, stale, or incoherent, build-prototype
must refuse and route back to `/ow:build-proto-prompt` or the compatible
`/ow:vision2prompt` compiler path. Do not repair strategic prompt text inside
build-prototype.

Optional:

- `.openworkflow/context/CONTEXT_MAP.yaml` or `.codex/context/CONTEXT_MAP.yaml`
- direct user constraints about selected direction, prototype medium, target
  tool, viewport, language, platform, brand, or acceptance bar
- `references/proto-redesign-artifact-contracts.md`
- `skills/build-prototype/references/philosophy-engine.md`
- `skills/prompt2proto/SKILL.md`
- `skills/prompt2proto/references/01_input_contract.md`
- `skills/prompt2proto/references/02_prompt_pack_readiness.md`
- `skills/prompt2proto/references/03_visual_translation_workflow.md`

Do not load unrelated specs, changes, runtime state, reviews, archives, or
implementation history unless the prototype question explicitly depends on
them.

## Output

For image-first planning, write prototype translation artifacts under the active
prototype or change path chosen by the workflow. The ready prompt pack remains
the input artifact, not something build-prototype recreates.

Expected build-prototype output families:

```txt
PROMPT2PROTO_TRANSLATION_PLAN.md
PROMPT2PROTO_EVIDENCE.yaml
NOTE.md
EVIDENCE.yaml updates that reference accepted prompt-pack inputs
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

1. Load the ready prompt pack and prompt2proto input/readiness references.
2. Refuse missing, thin, stale, or incoherent prompt packs. Route repair to
   `/ow:build-proto-prompt` or compatible `/ow:vision2prompt`; do not invent
   strategy in build-prototype.
3. Verify prompt-pack readiness, paragraph quality, prototype reality,
   screen_manifest linkage, prototype_system_contract, and post_validate before
   visual translation.
4. Use prompt2proto to preserve product strategy and technical screen
   coherence while translating the ready prompt pack into UI/UX prototype
   instructions and evidence.
5. Before accepting prototype instructions, use
   `skills/build-prototype/references/philosophy-engine.md` to calibrate
   density, information hierarchy, domain object emphasis, trust controls, and
   UI/UX credibility.
6. If the user asks to tune accepted baseline screens or an accepted prompt
   pack, hand off to `skills/tune-prototype/SKILL.md`.
7. Run `npm run validate` when the repository validator exists.

## Ready Prompt-Pack Consumption

1. Accept only prompt packs whose prompt text is ready for image generation and
   whose integrity, reality, executability, paragraph quality, and
   post-validation gates pass.
2. Preserve the prompt-pack strategy: product thesis, target user
   transformation, primary loop, non-goals, trust boundaries, and direction
   reasons to exist.
3. Preserve `prototype_system_contract` as the source of technical screen
   coherence: stable app shell, navigation taxonomy, data vocabulary, object
   anatomy, action bar, audit pattern, copy tone, and allowed screen deltas.
4. Apply the Chief PM plus Principal UI/UX philosophy engine to decide visual
   hierarchy, density, affordances, interaction believability, and UI/UX
   credibility.
5. Write provider-agnostic prototype instructions and evidence. Keep provider
   image generation, human visual review, visual parity, proto2html, specs,
   changes, teams, and runtime work out of scope.

## Build-Prototype Philosophy Engine

Use this engine after strategic prompt assets are ready and before downstream
visual translation is accepted:

- Chief PM lens: decide what the prototype must prove, what user decision is at
  stake, which domain objects matter, what trust boundary must be visible, and
  what information would change the next action.
- Principal UI/UX lens: decide the screen's hierarchy, density, layout anatomy,
  scan path, affordance clarity, interaction feedback, and inspection quality.
- Density is not a prompt length target. It is a product/design decision:
  operational users may need dense comparison surfaces, while sensitive or
  consumer flows may need fewer visible choices and stronger reassurance.
- Use `prototype_system_contract` for technical screen coherence. Use this
  philosophy engine for density and visual information judgment.

Reject both sparse mockups that hide the operating decision and overstuffed
concept posters that make everything equally important.

## Strategic Direction Rules

- Strategic direction generation belongs to build-proto-prompt. Build-prototype
  may choose which already-ready direction or screens to translate, but must
  not create new strategic directions.
- If ready directions differ only by visual style, route back to
  build-proto-prompt repair instead of treating them as valid prototype
  strategy.
- Preserve explicit non-goals, trust boundaries, privacy requirements, and user
  controls.
- Convert category anti-patterns into negative visual constraints, especially
  generic AI dashboards, consulting-report screens, or card walls when the
  product category calls for a richer operational shell.
- Consumed prompts must already specify screens, journeys, interactions,
  states, AI/system behavior, trust controls, privacy boundaries, visual
  direction, anti-goals, desired user feeling, and concrete sample content.
- The prompt text itself must pass paragraph quality; adjacent YAML fields do
  not rescue a terse `screen_prompts[].prompt`.
- The output is prototype translation evidence, not a new prompt pack,
  production spec, or task backlog.

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
