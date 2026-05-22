---
name: prompt2proto
description: Translate ready PROTO_PROMPT_PACK artifacts into credible UI/UX prototype instructions, evidence plans, and downstream handoff records. Use after vision2prompt/build-proto-prompt has produced ready prompt text and before provider-backed image generation, visual review, proto2html, specs, changes, or runtime work.
---

# Prompt2Proto

## Purpose

Translate ready strategic prototype prompt packs into reviewable UI/UX
prototype instructions and evidence records. This skill is the source method
behind the internal `/ow:prompt2proto` stage, but it does not by itself call an
image provider or claim visual quality.

`prompt2proto` starts where `vision2prompt` ends. It consumes a ready
`PROTO_PROMPT_PACK`, preserves the product strategy and screen coherence
contracts, and turns them into a concrete prototype translation plan that a
design or image-generation stage can execute without inventing product intent.

## Role Engine

Before translating, load
`skills/prompt2proto/references/00_role_philosophy_engine.md`.

Operate as:

- Chief PM: protects product intent, user decision context, workflow priority,
  domain fit, and evidence value.
- Principal UI/UX / product design lead: protects visual hierarchy,
  information density, layout anatomy, affordance clarity, interaction
  believability, and prototype inspection quality.

The role engine is required. A structurally complete translation still fails if
it reads like a generic image prompt, a decorative dashboard, a card wall, or a
concept poster rather than a plausible product interface.

Use this role engine as the build-prototype philosophy engine: Chief PM plus
Principal UI/UX judgment must come before visual translation. The Chief PM
decides product intent, domain fit, user decision context, and evidence value;
the Principal UI/UX lead decides information hierarchy, density calibration,
affordance clarity, interaction believability, and UI/UX credibility.

## Inputs

Required:

- `.openworkflow/prototypes/<id>/PROTO_PROMPT_PACK.yaml` or an equivalent
  ready prompt pack artifact
- prompt text with `prompt_text_manifest.status: ready_for_image_generation`
- `prompt_text_manifest.paragraph_quality_status: pass`
- `prompt_pack_integrity_gate.status: pass`
- `prototype_reality_gate.status: pass`
- `quality_rubric.prompt_executability.status: pass`
- `post_validate.status: pass` for multi-direction packs, or `skipped` for an
  explicit single-direction pack

Optional:

- `PROTO_PROMPT_PACK.md` readable view
- `EVIDENCE.yaml` or `EVIDENCE.md` for existing prototype lineage
- selected direction constraints from user review
- target medium, provider, canvas, viewport, or image count constraints

## References

Run these references in order:

1. `references/00_role_philosophy_engine.md`: role, taste, and guardrails.
2. `references/01_input_contract.md`: input readiness and refusal policy.
3. `references/02_prompt_pack_readiness.md`: gate and coherence checks.
4. `references/03_visual_translation_workflow.md`: UI/UX translation method.
5. `references/04_output_contract.md`: output and metadata shape.
6. `references/05_quality_rubric.md`: final review before handoff.

Load only the reference needed for the current step.

## Output

For source-level dogfood, write evidence under the selected change folder. For
workflow execution, write under the active prototype folder selected by the
command.

Expected output families:

```text
PROMPT2PROTO_TRANSLATION_PLAN.md
PROMPT2PROTO_EVIDENCE.yaml
NOTE.md
```

When a provider-backed generation stage is explicitly authorized later, the
same contract can support image metadata records. This skill only defines the
translation and evidence contract; it does not start provider generation.

## Workflow

1. Load the role engine and required input contract.
2. Refuse missing, thin, stale, incoherent, or not-ready prompt packs.
3. Preserve strategy from the prompt pack: product thesis, target user,
   user transformation, primary loop, trust boundaries, non-goals, and
   direction-level reasons to exist.
4. Preserve technical screen coherence from the prompt pack: app shell,
   navigation taxonomy, domain objects, screen ids, state model, data
   vocabulary, and allowed screen-specific deltas.
5. Apply the philosophy engine before translating screens: decide what must be
   visible, grouped, collapsed, delayed, or drilled into based on industry,
   role, risk, screen size, task frequency, and the user's next decision.
6. Translate each selected direction into a prototype system plan: screen
   sequence, hierarchy, density, component anatomy, state behavior,
   interaction affordances, sample data, trust controls, and negative visual
   constraints.
7. Calibrate information density as design judgment, not prompt length:
   decide what is visible, grouped, collapsed, delayed, or drilled into based
   on industry, role, risk, screen size, task frequency, and user attention.
8. Write translation evidence that names accepted inputs, refusals, output
   refs, limitations, and the next authorized handoff.
9. Stop before provider-backed generation, human visual review, visual parity,
   proto2html, storyboard, motion, specs, changes, or runtime work unless a
   later selected candidate explicitly authorizes that surface.

## Refusal Rules

Refuse and route back to prompt-pack repair when:

- readiness gates are missing or failing;
- prompt paragraphs are not dailin-grade or omit journey, interaction
  behavior, system response, trust controls, anti-goals, visual direction,
  desired user feeling, or concrete content;
- screen prompts do not resolve to `screen_manifest.target_screen_id`;
- screen coherence contracts are missing when multiple screens must share one
  product shell;
- the prompt pack asks prompt2proto to invent strategy instead of translate
  ready strategy;
- the requested output is provider generation, human visual review, visual
  parity scoring, proto2html, storyboard, motion, spec, change, or runtime
  work.

## Handoff

When translation passes, hand back to the orchestrating prototype workflow with
clear next actions:

- generate provider images only when a later queue authorizes it;
- repair prompt pack through build-proto-prompt/vision2prompt when readiness
  fails;
- move to tune only after accepted visual evidence exists;
- move to proto2html only after an accepted benchmark image or screen group
  exists.
