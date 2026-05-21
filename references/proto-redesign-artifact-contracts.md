# Proto Redesign Artifact Contracts

This reference defines the artifact vocabulary for the image-first `/ow:proto`
redesign. It is intentionally source-level: it does not change command runtime,
generated adapter surfaces, or validation command visibility.

## Scope

The redesigned proto flow has two prompt-producing modes:

- `strategic_proto_prompt_pack`: first-pass prompts generated from product
  vision and optional validation evidence.
- `refined_proto_prompt_pack`: screen-bound refinement prompts generated from
  baseline prototype output, the original prompt pack, and a tune request.

Review and decision evidence is recorded separately so prototype exploration
does not become hidden production implementation.

## Input Policy

### VISION-Only Input

`/ow:proto` may proceed from vision-only input when no validation artifact
exists. In that mode it must:

- state that validation evidence is absent
- extract the core product uncertainty from the vision
- generate strategic prototype directions, not implementation tasks
- avoid pretending that a validation decision has already happened

### Validation Present

When `VALIDATION.yaml` and `PROTOTYPE_BRIEF.md` are present, `/ow:proto` must:

- preserve the validation core question
- keep validation include and exclude scope as hard prototype boundaries
- use validation acceptance as evidence questions
- avoid broadening into later or supporting features unless the validation
  artifact explicitly includes them

### Automatic Validation

Automatic validation after vision creation is a separate future change. This
contract only defines how proto consumes validation when it exists and how proto
falls back when it does not.

## Strategic Proto Prompt Pack

Purpose: convert a product vision into multiple high-fidelity prototype prompt
directions grounded in distinct strategic hypotheses.

Required sections:

- `source`: vision, optional validation refs, constraints, target tool, target
  language, requested direction count
- `normalized_input`: domain, primary user, core pain, behavior change, success
  signal, differentiator, non-goals, trust or privacy constraints
- `strategic_core`: target user, behavior change, mechanism, differentiator,
  boundary conditions, central uncertainty
- `directions`: one entry per strategic prototype direction
- `build_recommendation`: first direction to generate and why
- `review_plan`: success signals, failure signals, and next test
- `negative_constraints`: what the generated prototype must not imply

Each direction requires:

- `direction_id`
- `name`
- `strategic_hypothesis`
- `validates`
- `main_risk`
- `prototype_prompt`
- `pm_judgment`

Prototype prompts should specify screens, journey, interactions, AI or system
behavior, trust/privacy controls, visual direction, anti-goals, and concrete
sample content.

## Refined Proto Prompt Pack

Purpose: convert baseline prototype screens and a tune request into
screen-bound prompts for the next generation pass while preserving product
system intent.

Required sections:

- `source`: baseline screens, baseline prompt, product vision, tune request,
  target form factor, locked elements, regeneration scope
- `baseline_audit`: screen ids, journey stages, user goals, visible components,
  system states, product features, trust boundaries, visual cues
- `product_system`: product thesis, primary loop, interaction model,
  information architecture, design language, component vocabulary, copy style,
  trust and boundary system, anti-goals
- `delta_rules`: `must_inherit`, `must_add`, `must_remove`, `flexible_change`
- `screen_manifest`: target screen ids, source mappings, generation order
- `global_design_prompt`
- `screen_prompts`
- `negative_prompt`
- `acceptance_checklist`

Each screen prompt requires:

- `prompt_id`
- `target_screen_id`
- `source_screen_ids`
- `screen_name`
- `strategic_purpose`
- `user_goal`
- `system_state`
- `canvas`
- `must_inherit`
- `must_add`
- `must_remove`
- `flexible_changes`
- `layout_structure`
- `required_components`
- `required_copy`
- `interaction_states`
- `system_behavior`
- `trust_privacy_safety`
- `visual_style_rules`
- `negative_constraints`
- `desired_user_feeling`
- `acceptance_criteria`

## Review Evidence

Prototype review evidence should record:

- generated artifact refs
- source prompt pack refs
- selected direction or screen ids
- user feedback
- accepted elements
- rejected elements
- tune requests
- recommendation: `continue`, `tune`, `pivot`, `stop`, or `needs_more_evidence`
- follow-up candidate ids when available

Review evidence may refer to generated images, screenshots, or design tool
outputs, but it should not embed large binary artifacts.

## Decision Handoff

After first-pass proto generation:

- if one direction is accepted, hand off to tune or design/spec planning
- if the direction is promising but not sufficient, create a refined prompt pack
- if no direction validates the product uncertainty, revisit vision or
  validation

After tune generation:

- accepted improvements become `must_inherit` in the next tune pass
- rejected elements become negative constraints
- production implementation must wait for an explicit selected change or spec

## Non-Goals

- Do not generate production implementation tasks from prompt packs.
- Do not add `/ow:proto2html`.
- Do not remove or internalize `ow:validation`.
- Do not expose runtime command or adapter surfaces from this contract.
- Do not hand-edit generated `.agents/` or `.openworkflow/` surfaces.
