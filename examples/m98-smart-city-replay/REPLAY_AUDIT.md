# M98 Smart City Replay Audit

This replay uses `PROTO_PROMPT_PACK.yaml` as the formal source artifact for the
M97 smart city prompt-pack gap. It does not run provider-backed image
generation, visual reference parity review, proto2html, or storyboard/motion
modeling.

## Result

Pass for prompt-pack source completeness.

The replay prompt pack now carries the product prototype brief inside the YAML
source before image generation:

- `prototype_brief` names CityFlow Copilot, positioning, user, primary loop,
  trust boundaries, non-goals, and desired feeling.
- `screen_manifest` models one shared map-first shell plus planning review,
  incident response, and asset capacity states.
- `global_design_system_prompt` keeps the digital twin map as the primary
  canvas and names negative visual patterns.
- `directions[0].screen_prompts` contains prompt text, negative prompts,
  example copy, and acceptance criteria for every screen manifest entry.
- `quality_rubric` covers prompt executability, product specificity, state
  coverage, and trust-boundary coverage.
- `prompt_pack_integrity_gate` and `prototype_reality_gate` both pass while
  `image_generation.status` remains `not_started`.

## M97 Gap Comparison

M97 found that richer D1-D3 prompt detail lived downstream in `EVIDENCE.yaml`
instead of consistently in `PROTO_PROMPT_PACK.yaml`. This replay closes that
specific source-quality gap: downstream generation no longer needs to invent
the planning, incident, or capacity product states because the formal prompt
pack includes them as screen-bound source fields.

This is not a visual quality claim. M99 or later work should still evaluate
reference parity, real map density, object-level data realism, and motion or
storyboard continuity.
