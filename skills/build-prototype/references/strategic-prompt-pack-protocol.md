# Strategic Prompt Pack Protocol

Use this reference when `/ow:proto` should produce high-fidelity prototype
prompt directions from proto-ready vision and a durable validation target.

`/ow:proto` is a strategy-to-prompt compiler. It preserves product intent,
turns validation uncertainty into prototype directions, and writes prompts that
an image-generation or design agent can execute without inventing strategy.

The concrete quality target is dailin-grade prompt text. The dailin
`OUTPUT_PROMPT.md` examples are the minimum passing benchmark for
`directions[].prototype_prompt` and `screen_prompts[].prompt`: complete
high-fidelity prototype-generation briefs with product context, journey,
interaction behavior, system response, trust controls, anti-goals, visual
direction, and desired user feeling. Short screen-state image instructions do
not pass this protocol.

## Vision2Prompt Reference Pipeline

Before writing `PROTO_PROMPT_PACK.yaml` or `PROTO_PROMPT_PACK.md`, run the
OW-owned dailin-grade pipeline under `references/vision2prompt/` in order:

1. `01_input_contract.md`: normalize durable vision, validation, direction
   count policy, target tool, fidelity, constraints, and missing-input rules.
2. `02_vision_decomposition.md`: extract target user, current alternative,
   behavior change, success signal, differentiator, trust/privacy requirements,
   non-goals, and central uncertainty.
3. `03_strategy_hypothesis_generation.md`: generate 5 to 8 candidate strategic
   hypotheses and select only materially distinct directions.
4. `04_product_system_extraction.md`: infer product experience model,
   product-system constants, screen_manifest, domain object model, state model,
   required data fields, trust controls, and anti-generic constraints.
5. `05_prototype_prompt_schema.md`: write directly executable prototype prompts
   with screen groups, states, actions, system behavior, example content,
   negative prompts, and acceptance criteria.
6. `06_output_templates.md`: keep YAML as source of truth and Markdown as the
   readable view.
7. `07_quality_rubric.md`: verify strategic distinctness, prompt
   executability, product specificity, trust/safety, and integrity gates before
   `prompt_text_manifest.status` becomes `ready_for_image_generation`.

Do not collapse this pipeline into a short image prompt. A valid strategic
prompt pack describes a product prototype system: product thesis, target user,
primary loop, strategic directions, screen groups, state behavior, concrete
data/copy, trust boundaries, negative constraints, and acceptance checks.

This pipeline intentionally mirrors dailin
`vision_to_strategic_prototype_prompt` Steps 1-6:

- normalize inputs;
- extract the strategic core;
- generate candidate strategic hypotheses;
- select the most differentiated directions;
- write each full prototype-generation prompt;
- recommend build order with success and failure signals.

## Validation Consumption

Validation is required before prototype generation.

- If a durable validation artifact exists, consume it and preserve its
  include/exclude boundaries.
- If validation is absent but vision exists, auto-run the same
  artifact-producing `/ow:validation` pass first.
- The auto-validation artifact must record `trigger.mode: agent_auto`,
  `trigger.requested_command: /ow:proto`, and
  `trigger.reason: missing_current_validation`.
- Do not proceed with ephemeral `vision_only` context.
- If validation conflicts with vision, stop for a decision instead of broadening
  the prototype target silently.

## Input Normalization

Extract or infer:

- product domain
- primary user
- usage context
- current alternative
- core pain
- desired behavior change
- strongest success signal
- core differentiator
- emotional value
- functional value
- trust or privacy constraints
- non-goals
- future opportunities
- validation target or central uncertainty

Record `validation_input.mode: validation_present` when consuming a current
validation artifact. Use `validation_input.mode: agent_auto_generated` only when
the proto command first created durable validation artifacts because none were
current.

## Strategic Core

Represent the product as:

```txt
target user + behavior change + mechanism + differentiator + boundary conditions
```

Find the central uncertainty:

- what makes the user start
- what makes the user repeat
- what makes the user trust the system
- what makes the user switch from the current alternative
- what must be true for the product to feel meaningfully different

## Product Experience Model

Before generating strategic directions, infer the product category and product
shell that the vision implies. Record it as `product_experience_model`.

Required dimensions:

- `product_archetype`: the target product category, such as map-first smart city
  operations dashboard, daily voice-call ritual, memory-centered companion room,
  scenario playground, inbox, workspace, board, editor, or console.
- `primary_canvas`: the main surface that should dominate the prototype, such
  as map, call console, conversation room, timeline, board, editor, inbox, or
  dashboard.
- `information_architecture`: navigation model, major domains, hierarchy, and
  product areas.
- `domain_object_model`: concrete user-visible objects, records, entities, and
  business data.
- `primary_task_loop`: the end-to-end user workflow the screen group must make
  understandable.
- `interaction_state_model`: selected, expanded, hover, empty, loading,
  warning, blocked, pending human confirmation, and other category-relevant
  states.
- `data_realism_requirements`: sample fields, labels, metrics, values, and
  operational details that make the prototype feel like real product work.
- `visual_language`: category-specific layout and component expectations.
- `anti_generic_constraints`: forbidden generic patterns such as AI governance
  report dashboards, consulting slide layouts, card walls, or chatbot shells
  when they do not match the target category.

Use this model to decide whether concepts from the vision are separate product
directions or modules, scenarios, layers, workflows, or states inside one
product shell. For example, planning approval, incident response, and asset
capacity may be modules inside one smart-city operations dashboard rather than
three separate prototype directions.

## Hypothesis Generation

Generate 5-8 candidate hypotheses, then choose the strongest directions.

Template:

```txt
If the product is shaped as [product form]
and uses [core mechanism]
to reduce or increase [friction or motivation],
then [target user] will [desired behavior]
because [emotional or functional reason].
```

A direction is distinct only if it differs from others on at least two
dimensions:

- product form
- user initiation trigger
- interaction model
- emotional driver
- learning or usage mechanism
- retention mechanism
- validation metric
- main risk

Do not split directions by scenario labels alone. A scenario is a product
direction only when it changes product form, product loop, trigger,
interaction model, emotional driver, retention mechanism, validation metric, or
main risk.

Reject directions that only change colors, layout, visual tone, or component
style.

Each selected direction should name why it deserves prototype generation:
what it tests, what it risks, what the user should feel, and which validation
signal it can make observable.

## Prompt Pack Structure

`PROTO_PROMPT_PACK.yaml` should follow `schemas/proto-prompt-pack.schema.json`
and include:

- `prompt_pack_type: strategic_proto_prompt_pack`
- `source`
- `validation_input`
- `normalized_input`
- `strategic_core`
- `prototype_brief`: product name, positioning, target user, current
  alternative, core idea, primary loop, trust boundaries, non-goals, and desired
  feeling
- `product_experience_model`
- `screen_manifest` with target screen ids, journey stages, user goals, system
  states, required components, required data fields, primary actions, AI
  behavior or explicit non-AI rationale, trust controls, example copy, and
  acceptance criteria
- `global_design_system_prompt`: visual language, layout system, component
  vocabulary, information density, copy tone, responsive/canvas rules, and
  negative visual patterns
- screen-bound `screen_prompts` tied to `screen_manifest` ids, with standalone
  prompt text, negative prompt, example copy, and acceptance criteria
- `quality_rubric`: prompt executability, strategic distinctness, product
  specificity, state coverage, and trust-boundary coverage
- `directions`
- `build_recommendation`
- `prompt_pack_integrity_gate`
- `prototype_reality_gate`
- `post_validate`
- `negative_constraints`
- `review_plan`

`PROTO_PROMPT_PACK.md` should be the human-readable view.

Each direction needs:

- `direction_id`
- `name`
- `strategic_hypothesis`
- `validates`
- `main_risk`
- `distinctness_rationale`
- `prototype_prompt`
- `screen_prompts`
- `pm_judgment`

When `prompt_text_manifest.status` becomes `ready_for_image_generation`, every
direction screen prompt must resolve to a `screen_manifest.target_screen_id`.
Do not mark prompt text ready when screen prompts are detached from the product
journey, missing negative prompts or example copy, or only restate a freeform
`prototype_prompt`.

## Prototype Prompt Requirements

Each prompt must include:

- product name
- positioning
- target user
- core product idea
- required screens
- complete user journey
- interaction requirements
- system or AI behavior requirements
- trust, privacy, and user control requirements
- visual direction
- anti-goals
- desired user feeling
- concrete sample content

Prompt text must carry those requirements inside the actual paragraphs used for
generation. Do not rely on adjacent YAML fields to rescue a terse
`screen_prompts[].prompt`.

Each screen prompt should be able to stand alone. It should name the journey
stage, user goal, system state, selected object when relevant, required
components, data fields, actions, AI/system behavior, trust controls, negative
prompt, and acceptance criteria.

Minimum screen prompt anatomy:

- product and direction context;
- journey stage and screen purpose;
- target user goal and current system state;
- visible components and domain objects;
- realistic data, copy, labels, metrics, owners, timestamps, or messages;
- primary user actions and system response;
- trust, privacy, approval, memory, or user-control surfaces;
- visual direction tied to the product category and primary canvas;
- negative constraints and anti-goals;
- screen-bound acceptance criteria and desired user feeling.

The prompt should be specific enough that another agent can generate the first
screen group without asking what the product is, who it serves, what behavior
should change, what must be shown, what must not be shown, or what counts as a
good prototype.

## Build Recommendation

Recommend the first direction to generate by weighing:

- closeness to the strongest success signal
- ability to validate the biggest unknown quickly
- prototype feasibility
- user behavior observability
- risk reduction

Include success signals, failure signals, and what to test next if it works.

## Quality Gate

Revise before finishing if:

- directions are mostly visual variations
- prompts are too abstract for a design tool
- prompt text reads like a single screenshot description instead of a product
  prototype brief
- `screen_manifest` or screen-bound prompt content is missing for a
  multi-screen prototype
- concrete domain objects, data fields, example copy, actions, and state
  behavior are absent
- non-goals are not converted into anti-goals
- AI/system behavior is missing for an AI-mediated product
- trust/privacy controls are absent when memory, personalization, or sensitive
  user data is involved
- prompt pack integrity, prototype reality, or post-validate gates are missing
  or failing while image generation is queued or complete
- output drifts into implementation backlog or production spec
- validation is missing, stale, or represented only as ephemeral context
