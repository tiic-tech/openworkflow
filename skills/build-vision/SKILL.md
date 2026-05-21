---
name: build-vision
description: Conduct deep product vision discovery without eager artifact writes, then compile proto-ready vision artifacts only after the user confirms readiness. Use when the user invokes /ow:vision, wants to clarify a product idea, or needs a vision that can drive high-quality prototype prompts.
---

# Build Vision

## Purpose

Turn messy product intent into a proto-ready vision contract.

This skill is the native source behavior for `/ow:vision`. It treats vision as
the highest-leverage discovery stage because every downstream artifact depends
on it. If the vision is thin or wrong, validation, prototype prompts, generated
prototypes, tuning, specs, and implementation all become expensive work against
weak intent.

`build-vision` acts as:

- product partner
- requirements interrogator
- intent compiler

It should make the human interview feel fluid while still producing durable,
auditable artifacts at meaningful checkpoints.

## Inputs

Required, one of:

- direct user product idea, opportunity, or broad goal
- existing `.openworkflow/vision/VISION_CONTRACT.yaml`
- existing `.openworkflow/vision/VISION.md`
- existing `.openworkflow/vision/sessions/<id>/VISION_SESSION.yaml`

Optional:

- `.openworkflow/CURRENT_STATE.yaml`
- `.openworkflow/context/CONTEXT.md`
- `.openworkflow/context/CONTEXT_MAP.yaml`
- `.openworkflow/context/GLOSSARY.yaml`
- `docs/DISCOVER_LOOP_UPGRATE_PLAN.md`
- `skills/build-vision/references/vision-interview-protocol.md`
- `skills/build-vision/references/proto-readiness-rubric.md`
- reference product notes, constraints, screenshots, or prior discovery notes

Avoid loading validation, prototype, spec, change, runtime, or implementation
history unless the user's current vision question explicitly depends on it.

## Interaction Modes

### Interview Mode

Default mode. Ask one focused question at a time and do not write durable
`.openworkflow/vision/**` artifacts after every answer.

Use conversation context as temporary working memory. Preserve flow, challenge
weak answers, and keep exploring until the product intent is strong enough to
compile.

### Checkpoint Mode

Write a lightweight checkpoint only when:

- the user explicitly asks to record progress
- a topic closes
- the user needs to pause
- the session contains a load-bearing ambiguity that should not be lost
- a long interview reaches a natural review point

Checkpoint mode is not final vision compile.

### Compile Mode

Compile durable artifacts only when:

- mandatory discovery dimensions have enough evidence
- proto-readiness is sufficient
- unresolved blockers are explicit
- the user confirms that the interview can stop

Expected durable outputs:

```text
.openworkflow/vision/VISION.md
.openworkflow/vision/VISION_CONTRACT.yaml
.openworkflow/vision/sessions/<id>/VISION_SESSION.yaml
.openworkflow/vision/sessions/<id>/NOTE.md
```

Context files may be updated only when context has stabilized.

## Discovery Coverage

Before compile, cover:

- target user and beneficiary
- usage context
- current alternative
- pain and motivation
- desired behavior change
- core product mechanism
- core differentiator
- emotional value
- functional value
- strongest success signal
- failure signals
- trust, privacy, safety, and user-control boundaries
- explicit non-goals
- future opportunities that must remain deferred
- validation target

Do not treat this as a fixed questionnaire. Follow the user's answers and
continue deeper when an answer exposes ambiguity, contradiction, or leverage.

## Proto-Readiness Gate

`VISION.md` is ready only when `/ow:proto` can use it to generate high-quality
strategic prototype prompt packs without inventing the core product strategy.

Before compile, verify that `/ow:proto` could derive:

- 3-5 strategically distinct prototype directions
- target user, behavior change, mechanism, differentiator, and boundary
  conditions
- complete screen and journey requirements
- AI/system behavior when AI is part of the product
- trust, privacy, safety, and user-control constraints
- anti-goals converted into prompt constraints
- strongest success and failure signals
- a clear validation target

If these cannot be derived, continue interviewing or record explicit blockers.

## Artifact Guidance

When compiling, preserve:

```yaml
strategic_core:
  target_user:
  context:
  current_alternative:
  pain:
  desired_behavior_change:
  core_mechanism:
  core_differentiator:
  strongest_success_signal:
  failure_signals:

product_system_seed:
  product_thesis:
  primary_loop:
  interaction_model:
  feature_system:
  emotional_value:
  functional_value:
  trust_boundary:
  privacy_boundary:
  anti_goals:
  future_opportunities:

proto_readiness:
  status: missing|thin|ready|blocked
  missing_for_proto:
  prototype_direction_seeds:
  prompt_constraints:
  validation_target:
  downstream_notes:
```

Use coverage statuses such as `missing`, `thin`, `solid`, and `conflicted` when
a dimension is not ready.

## Forbidden Defaults

- Do not write durable vision files after every user answer.
- Do not compile final vision artifacts after a fixed small number of questions.
- Do not create validation, prototype, spec, change, or runtime artifacts.
- Do not create prototype prompts from `/ow:vision`; hand off to `/ow:proto`.
- Do not hide thin or conflicted answers as polished product truth.
- Do not preserve auditability by destroying conversation flow.

## Handoff

Hand off to `/ow:validation` only after compile mode has produced proto-ready
vision artifacts or after the user explicitly asks for validation against a
known partial vision.

If the user asks for prototype prompts directly, first check proto-readiness.
When ready, hand off to `/ow:proto`; when thin, continue the vision interview.

