# C003 Implementation Brief

## Goal

Add a deterministic `prototype_reality_gate` to strategic prompt-pack artifacts
so OW can block prompt packs that are structurally valid but product-invalid
before `/ow:prompt2proto` starts image generation.

## Required Gate Concepts

- `status`: pending, pass, or fail.
- `trigger`: after product_experience_model and prompt text are ready, before
  image generation.
- Required dimensions:
  - product_category_fit
  - primary_canvas_fit
  - domain_object_realism
  - task_loop_completeness
  - interaction_state_coverage
  - data_realism
  - anti_generic_constraints
- `failures`: concrete reasons the prompt pack is too generic or mismatched.
- `outcome_notes`: concise explanation for Agents.
- `repair_route`: `/ow:vision2prompt`.

## Boundaries

C003 is deterministic artifact validation only. It must not inspect generated
images, call visual models, change providers, or enter smart-city-specific
fixture assertions. C004 owns the smart city regression.
