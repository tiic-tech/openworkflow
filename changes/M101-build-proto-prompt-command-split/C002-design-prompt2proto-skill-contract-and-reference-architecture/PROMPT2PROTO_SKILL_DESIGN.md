# Prompt2Proto Skill Design

## Method Source

This design uses the user-requested `skill_generator` method:

- Step 01 input analysis: target domain is prompt-pack to UI/UX prototype
  translation.
- Step 00 role engine: Chief PM plus Principal UI/UX product design lead.
- Step 02 artifact initialization: lean `SKILL.md`, `agents/openai.yaml`, and
  numbered references.
- Step 03 reference generation: each reference has input/output role coupling
  and validation responsibilities.
- Step 04 internal validation: check structure, role coupling, placeholder
  absence, and boundary integrity.

## Contract

prompt2proto consumes ready `PROTO_PROMPT_PACK` artifacts. It must refuse packs
that have not passed prompt readiness, paragraph quality, integrity, reality,
executability, post-validation, and screen linkage gates.

It translates, but does not invent, product strategy. If strategy or screen
coherence is missing, the repair route is build-proto-prompt/vision2prompt.

## Reference Architecture

- `00_role_philosophy_engine.md`: Chief PM plus Principal UI/UX identity,
  perspective lens, heuristics, and guardrails.
- `01_input_contract.md`: required prompt-pack readiness and refusal output.
- `02_prompt_pack_readiness.md`: gate, linkage, and coherence checks.
- `03_visual_translation_workflow.md`: screen-system, hierarchy, density,
  component, state, interaction, trust, and content translation.
- `04_output_contract.md`: translation plan, evidence YAML, and future image
  metadata shape.
- `05_quality_rubric.md`: pass/fail checks and unsupported-claim scan.

## Key Separation

Multi-screen drift is a technical contract problem. It belongs upstream in
build-proto-prompt as `prototype_system_contract` or
`screen_coherence_contract`.

Information density is a design control problem. It belongs in prompt2proto and
build-prototype, where Chief PM plus Principal UI/UX judgment decides visible,
grouped, collapsed, delayed, and drilled-in information by domain, role, risk,
screen size, task frequency, and user attention.

## Explicit No-Go

This design does not authorize provider-backed image generation, human visual
review, visual reference parity scoring, proto2html, storyboard, motion, specs,
changes, or runtime work.
