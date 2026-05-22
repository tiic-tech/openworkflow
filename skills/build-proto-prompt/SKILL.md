---
name: build-proto-prompt
description: Compile proto-ready vision and validation into ready PROTO_PROMPT_PACK artifacts. Use for the internal /ow:build-proto-prompt prompt-pack compiler boundary before prompt2proto, image generation, visual review, proto2html, specs, changes, or runtime work.
---

# Build Proto Prompt

## Purpose

Compile durable vision and validation inputs into ready strategic prototype
prompt packs. This source skill owns the prompt-pack compiler boundary that was
previously embedded in `build-prototype`.

`build-proto-prompt` does not generate images, review visual output, build
HTML, create specs, or start implementation. It writes high-quality
`PROTO_PROMPT_PACK` artifacts that can be consumed by `prompt2proto`.

## Role Engine

Before compiling prompts, adopt the Co-Founder plus Chief PM / senior product
strategist role engine:

- Co-Founder: protects product thesis, user transformation, differentiated
  product form, reason-to-exist, and ambition.
- Chief PM: protects validation fit, risk reduction, user decision context,
  product-system completeness, handoff readiness, and no-go boundaries.

The references are tools for this role engine, not a checklist that proves
quality by itself.

## Inputs

Required:

- durable vision contract or equivalent direct user vision
- durable validation target
- resolved strategic direction count from the prototype orchestration preflight

Optional:

- context map or glossary
- target platform, canvas, tool, fidelity, language, brand, or acceptance bar
- existing prototype prompt pack only when repairing a failed prompt-pack gate

## References

Run these references in order:

1. `references/prompt-pack-compiler-protocol.md`
2. `references/output-boundary.md`

Until the compiler references are fully split, reuse the OW-owned
`skills/build-prototype/references/strategic-prompt-pack-protocol.md` and
`skills/build-prototype/references/vision2prompt/01_input_contract.md` through
`07_quality_rubric.md` as the detailed prompt-generation toolkit.

## Output

Write prompt-pack artifacts under the active prototype folder:

```text
PROTO_PROMPT_PACK.yaml
PROTO_PROMPT_PACK.md
REVIEW_PLAN.md
EVIDENCE.yaml
NOTE.md
```

The YAML prompt pack is the source of truth. Markdown is the readable view.

## Workflow

1. Confirm durable vision and validation inputs are present and strong enough.
2. Normalize product domain, target user, usage context, current alternative,
   core pain, behavior change, success signal, differentiator, trust
   boundaries, non-goals, and validation target.
3. Apply the Co-Founder plus Chief PM role engine before generating directions.
4. Infer product experience model: archetype, primary canvas, information
   architecture, domain objects, task loop, state model, data realism, visual
   language, anti-generic constraints, and category quality bar.
5. Generate candidate strategic hypotheses, then select materially distinct
   directions based on product form, trigger, interaction model, emotional
   driver, retention mechanism, validation metric, and main risk.
6. Write dailin-grade direction and screen prompt paragraphs with journey,
   screen components, interaction behavior, system response, concrete content,
   trust controls, anti-goals, visual direction, desired user feeling, product
   thesis, reason-to-exist, and user transformation.
7. Run prompt-pack readiness gates: integrity, prototype reality, prompt
   executability, paragraph quality, screen manifest linkage, and
   post-validation.
8. Set `prompt_text_manifest.status: ready_for_image_generation` only when all
   readiness gates pass.
9. Keep `image_generation.status: not_started` and hand off to `prompt2proto`
   only after prompt-pack readiness passes.

## Boundary

Allowed:

- compile strategic prompt packs;
- repair prompt-pack text when readiness gates fail;
- write review plan and evidence about prompt readiness;
- preserve no-go constraints for downstream stages.

Forbidden:

- provider-backed image generation;
- human visual review;
- visual reference parity scoring;
- proto2html;
- storyboard or motion modeling;
- production design/spec/change/runtime work;
- narrowing `build-prototype` behavior.

## Handoff

When all gates pass, hand internally to `prompt2proto` with a ready prompt
pack. When gates fail, keep `image_generation.status: not_started`, record the
failed gate, and repair inside `build-proto-prompt` instead of downstreaming a
thin prompt pack.
