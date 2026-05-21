# Refined Prompt Pack Protocol

Use this reference when `/ow:proto` or tune-oriented prototype work should
convert accepted baseline screens and user feedback into a screen-bound refined
prompt pack.

## Input Normalization

Collect or infer:

- baseline screen sources: screenshots, screen descriptions, source screen IDs,
  accepted generated outputs, or prior prompt pack
- baseline prompt text when available
- tune request
- product vision or strategic direction when available
- target form factor, target tool, target screen count, locked screens,
  regeneration scope, language, and constraints

Require at least one baseline input and one tune request. If the user provides a
screen group, audit the group before writing prompts.

## Baseline Screen Audit

For each source screen, record:

- source screen ID and inferred screen name
- journey stage, user goal, and system state
- represented feature and primary action
- core components and screen-specific copy tone
- AI/system behavior
- trust, privacy, safety, memory, and user-control affordances
- visual cues and product-specific motifs
- elements that must be preserved
- platform artifacts to transform or remove
- assumptions or missing evidence

## Product System Extraction

Extract the continuity rules that should survive the next generation pass:

- product thesis and target user
- primary behavior loop
- brand promise and emotional job
- interaction model and information architecture
- feature system and component vocabulary
- visual language and copywriting system
- trust, boundary, privacy, and safety system
- anti-goals
- stable constants and adaptable variables

## Tune Interpretation

Translate the user's request into explicit deltas:

- additions: new screens, components, states, copy, actions, system behavior,
  platform patterns, or trust controls
- removals: unwanted features, visual artifacts, incorrect brand elements,
  forbidden UI patterns, obsolete copy, or unsafe AI representations
- transformations: form-factor adaptation, journey reshaping, layout changes,
  component transformations, or state changes
- locked elements: screens or product-system traits that must not move
- flexible areas: safe exploration space that remains inside the product
  thesis, brand promise, non-goals, and screen purpose

If additions and removals conflict with baseline continuity, state the
assumption before producing prompts.

## Delta Rules

Write global and screen-level rules in four buckets:

- `MUST_INHERIT`: product thesis, primary loop, core features, emotional
  promise, visual motifs, component vocabulary, copy tone, system behavior,
  trust boundaries, screen purpose, and locked content
- `MUST_ADD`: requested screens, components, states, copy, actions, system
  behavior, target-platform patterns, and controls
- `MUST_REMOVE`: requested removals, platform artifacts, obsolete copy,
  incorrect AI representations, and forbidden UI patterns
- `FLEXIBLE_CHANGE`: layout composition, card arrangement, copy phrasing within
  tone rules, icon details, hierarchy, spacing, and target-native density

Requested removals must appear in global negative constraints, per-screen
negative constraints, and acceptance checks.

## Prompt Pack Structure

`REFINED_PROTO_PROMPT_PACK.yaml` should follow
`schemas/proto-prompt-pack.schema.json` and include:

- `prompt_pack_type: refined_proto_prompt_pack`
- `source`
- `baseline_audit`
- `product_system`
- `delta_rules`
- `screen_manifest`
- `global_design_prompt`
- `screen_prompts`
- `negative_constraints`
- `review_plan`

`REFINED_PROTO_PROMPT_PACK.md` should be the human-readable view.

Each screen prompt needs:

- `prompt_id`
- `target_screen_id`
- `screen_name`
- source screen IDs
- target form factor and canvas
- strategic purpose and user goal
- system state
- must inherit, add, remove, and flexible change rules
- layout structure and required components
- required copy or copy rules
- interaction states and AI/system behavior
- trust, privacy, safety, and user-control requirements
- visual style rules
- negative constraints
- desired user feeling
- acceptance criteria

## Screen Manifest

Use stable IDs:

- source screens: `SRC_M01`, `SRC_W01`, `SRC_T01`, or `SRC_01`
- target screens: `WEB_S01`, `MOB_S01`, `TAB_S01`, or `REFINE_S01`
- prompt IDs: `PROMPT_WEB_S01`, `PROMPT_MOB_S01`, or similar

For each target screen, include:

- target screen ID and name
- prompt ID
- source screen IDs
- target form factor and canvas
- journey stage
- generation scope: `CREATE_NEW`, `TRANSFORM`, `REFINE`, `REGENERATE`,
  `LOCKED`, `MERGE`, `SPLIT`, or `DELETE`
- generation order and dependencies
- locked elements
- per-screen delta rules
- prompt and negative prompt
- acceptance criteria

Preserve screen IDs across rounds unless the screen is deleted, split, merged,
or explicitly renamed.

## Quality Gate

Revise before finishing if:

- only one source screen was considered from a supplied group
- visual style changed but product loop, feature system, or trust controls were
  lost
- requested removals are absent from negative constraints or examples
- prompts are not bound to target screens and source screens
- desktop outputs read like widened mobile layouts
- new screens feel like unrelated product ideas
- the downstream generator would need extra context to produce the screens

The final pack should let a reviewer trace every generated screen back to the
baseline product system and the user's requested deltas.
