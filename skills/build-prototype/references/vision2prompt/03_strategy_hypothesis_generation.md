# 03 Strategy Hypothesis Generation

Use this reference to create prototype directions that test different product
strategy assumptions, not different visual skins.

## Dailin Workflow Mapping

This file is the OW-owned equivalent of dailin
`vision_to_strategic_prototype_prompt/reference/03_strategy_hypothesis_generation.md`.
It maps dailin Steps 3 and 4 into OW prompt-pack generation: create more
candidate hypotheses than needed, score them, then select the resolved count by
strategic diversity and prototypeability.

The selected directions must justify different prompt paragraphs. A direction
does not deserve its own `prototype_prompt` merely because it has a different
screen title, scenario label, module name, layout, or visual mood.

The hypothesis engine must behave like a senior product manager, not a prompt
formatting script. Each candidate should make a product argument: what form it
takes, why that form should exist, what user transformation it seeks, and what
risk or learning it exposes.

## Hypothesis Template

```text
If the product is shaped as [product form]
and uses [core mechanism]
to reduce or increase [friction or motivation],
then [target user] will [desired behavior]
because [emotional or functional reason].
```

## Direction Differentiation Dimensions

A direction is strategically distinct only when it differs from other selected
directions on at least two dimensions:

- product thesis
- product form
- user initiation trigger
- interaction model
- emotional driver
- functional mechanism
- retention mechanism
- validation metric
- main risk
- trust model
- privacy model
- reason-to-exist

## Candidate Pool

Generate 5 to 8 candidate hypotheses before selecting the resolved count. Use
patterns like these only as seeds:

- Companion space: persistent home base, memory, low-pressure return.
- Daily ritual: scheduled call, check-in, reminder, recap, or routine.
- Scenario playground: real-life situations with branching support.
- Progress mirror: recap, journal, timeline, or concrete evidence of progress.
- Rescue-first interface: stuck-state recovery and scaffolding as the core UI.
- Personalization engine: explicit memory, preference, and recommendation
  controls.
- Operations console: object selection, evidence, actions, owners, and audit.
- Workspace or editor: create, review, revise, and publish inside one loop.

## Selection Algorithm

1. Score each candidate on vision alignment, distinctiveness, testability,
   prototypeability, and risk reduction.
2. Penalize candidates that only arrange screens without a clear product
   thesis, user transformation, differentiated form, or reason-to-exist.
3. Select the top `direction_count_policy.resolved_count` directions with
   maximum diversity.
4. Merge or replace directions that share the same product form and trigger.
5. Decide whether scenario labels are true directions or screens/states inside
   one product shell.

## Rejection Rules

Reject a direction when it:

- changes only color, layout, tone, or component style;
- ignores the strongest success signal;
- omits the core differentiator;
- violates non-goals or trust boundaries;
- is too broad to prototype as screens and states;
- cannot produce observable validation signals;
- recreates the named current alternative;
- is complete as a screen inventory but empty as a product thesis.
