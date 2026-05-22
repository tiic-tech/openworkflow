# 01 Input Contract

Use this reference before consuming a `PROTO_PROMPT_PACK`.

## Required Input State

The prompt pack must be ready for visual translation:

- `prompt_text_manifest.status: ready_for_image_generation`
- `prompt_text_manifest.paragraph_quality_status: pass`
- `prompt_pack_integrity_gate.status: pass`
- `prototype_reality_gate.status: pass`
- `quality_rubric.prompt_executability.status: pass`
- `post_validate.status: pass` for multi-direction packs, or `skipped` for an
  explicit single-direction pack

Every selected direction must provide:

- product thesis and reason-to-exist;
- target user transformation;
- direction-level `prototype_prompt`;
- screen prompts tied to `screen_manifest.target_screen_id`;
- concrete data, copy, states, actions, system response, trust controls,
  anti-goals, visual direction, and desired user feeling.

## Refusal Output

When an input fails, write a short refusal note or evidence entry with:

- `status: refused`
- failing gate or missing field
- repair route: build-proto-prompt/vision2prompt
- why prompt2proto cannot safely invent the missing content

Do not silently repair strategic prompt text in this stage.

## Boundary

Allowed input interpretation:

- choose which ready directions/screens to translate;
- resolve output ordering and provider-agnostic image plan;
- calibrate visual hierarchy, density, and component anatomy;
- record blockers and handoff facts.

Forbidden input expansion:

- new strategic directions;
- new validation target;
- provider-specific generation;
- visual acceptance claims;
- HTML reconstruction;
- specs, changes, runtime work, storyboard, or motion.
