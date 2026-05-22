# 02 Vision Decomposition

Use this reference to convert raw vision and validation artifacts into
decision-ready strategy. Keep the decomposition compact in final artifacts, but
make it precise enough that later prompt text does not invent product strategy.

## Dailin Workflow Mapping

This file is the OW-owned equivalent of dailin
`vision_to_strategic_prototype_prompt/reference/02_vision_decomposition.md`.
It maps dailin Step 2, "Extract Strategic Core", into durable OW prompt-pack
fields. The decomposition must be strong enough that every later
`directions[].prototype_prompt` and `screen_prompts[].prompt` can explain:

- who the product serves;
- what current alternative or pain it displaces;
- what behavior should change;
- what core mechanism and differentiator make the product worth testing;
- what trust, privacy, and non-goal boundaries constrain the prototype;
- what validation target the image prompt should make observable.

If these elements are absent, a long prompt will still be strategically thin.
Do not compensate by adding generic screen inventory, generic AI language, or
visual style.

## Extraction Schema

- `target_user`: who has the problem.
- `context`: where and when the problem happens.
- `current_alternative`: what the user does today.
- `pain`: why the current alternative is insufficient.
- `desired_behavior_change`: what the user should do more, less, faster, more
  safely, or more consistently.
- `strongest_success_signal`: what observable behavior proves progress.
- `core_differentiator`: why this is not the current alternative with a new UI.
- `emotional_value`: what the user should feel that makes repeated use likely.
- `functional_value`: what concrete capability the product provides.
- `trust_requirements`: what the product must show or constrain to earn trust.
- `privacy_requirements`: what data must be visible, editable, deletable,
  temporary, or off by default.
- `non_goals`: what the prototype must not imply or include.
- `future_opportunities`: adjacent features intentionally deferred.
- `validation_target`: what the next prototype should prove or disprove.

## Strategic Core Formula

Compress the vision into:

```text
For [target user],
who currently [current alternative / pain],
the product helps them [desired behavior]
through [core mechanism],
while [trust boundary / non-goal].
```

## Central Uncertainty Patterns

Classify the validation target with one or more uncertainty types:

- Activation: what gets the user to start.
- Engagement: what keeps the user moving in-session.
- Retention: what brings the user back.
- Trust: what makes the user allow data, memory, recommendation, automation, or
  AI mediation.
- Differentiation: what makes the product feel meaningfully better than the
  current alternative.
- Transfer: whether product behavior creates value outside the product.
- Safety or boundary: whether the product can create value without violating
  user control, privacy, emotional safety, or domain constraints.

## Prototype-Relevant Compression

When writing the prompt pack, carry forward at least:

- target user
- behavior change
- strongest success signal
- differentiator
- validation target
- trust/privacy requirements
- non-goals and anti-goals

Anything not carried forward can disappear from downstream prototype
generation.
