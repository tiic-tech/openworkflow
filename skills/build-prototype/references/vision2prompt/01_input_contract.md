# 01 Input Contract

Use this reference before `/ow:vision2prompt` writes a strategic prototype
prompt pack. The goal is to normalize product intent into fields that can
survive handoff, validation, and image generation.

## Required Inputs

- Durable vision artifact: `VISION.md` and `VISION_CONTRACT.yaml` or current
  vision session content.
- Durable validation target: current `VALIDATION.yaml`.
- Direction count policy: user-requested count or the `/ow:proto` resolved
  default.

Do not compile prompt text from chat memory alone.

## Optional Inputs

- `TARGET_TOOL`: image generator, Figma, v0, app builder, or human designer.
- `OUTPUT_LANGUAGE`: default to the user's language for framing; prototype
  prompts may be English when the target tool benefits from English prompts.
- `DOMAIN`: infer from vision when missing.
- `FIDELITY`: default to high-fidelity product prototype.
- `CONSTRAINTS`: brand, platform, compliance, privacy, safety, or product
  boundaries.

## Normalized Input Fields

Extract or conservatively infer:

- `product_domain`
- `primary_user`
- `usage_context`
- `current_alternative`
- `core_pain`
- `desired_behavior_change`
- `strongest_success_signal`
- `core_differentiator`
- `emotional_value`
- `functional_value`
- `trust_requirements`
- `privacy_requirements`
- `non_goals`
- `future_opportunities`
- `validation_target`

## Missing Input Policy

Ask only when missing information would force invention of strategy. If the
vision and validation target are specific enough, infer conservative defaults
and record assumptions in the prompt pack.

Return to `/ow:vision` or `/ow:validation` when any of these are missing:

- target user
- desired behavior change
- core differentiator
- trust/privacy boundary for sensitive or AI-mediated products
- validation target

## Output Boundary

This step prepares inputs only. It must not write image assets, generated
prototype files, design specs, production specs, or implementation backlog.
