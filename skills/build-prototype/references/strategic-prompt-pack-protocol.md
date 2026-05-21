# Strategic Prompt Pack Protocol

Use this reference when `/ow:proto` should produce high-fidelity prototype
prompt directions from proto-ready vision and a durable validation target.

`/ow:proto` is a strategy-to-prompt compiler. It preserves product intent,
turns validation uncertainty into prototype directions, and writes prompts that
an image-generation or design agent can execute without inventing strategy.

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
- `directions`
- `build_recommendation`
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
- `pm_judgment`

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
- non-goals are not converted into anti-goals
- AI/system behavior is missing for an AI-mediated product
- trust/privacy controls are absent when memory, personalization, or sensitive
  user data is involved
- output drifts into implementation backlog or production spec
- validation is missing, stale, or represented only as ephemeral context
