# C001 Implementation Brief

## Goal

Define the native OW artifact contract for `/ow:tune` refined prompt packs. The
contract should absorb the stable structure from `prototype_tune_to_refined_prompt`
without copying the reference skill wholesale.

## Required Contract Concepts

- Normalized tuning input and baseline source refs.
- Baseline screen audit for every source screen.
- Product system extraction with stable constants and adaptable variables.
- Delta rules: `MUST_INHERIT`, `MUST_ADD`, `MUST_REMOVE`, `FLEXIBLE_CHANGE`.
- Screen mapping from source screens to target screens.
- Screen-bound refined prompts with `target_screen_id`, `source_screen_ids`,
  prompt text, negative prompt, and acceptance criteria.
- Generation order and acceptance checklist.

## Boundaries

Do not update generated `/ow:tune` skill guidance in this change; C002 owns
generated protocol wiring. Do not add image generation or async subagent logic.
