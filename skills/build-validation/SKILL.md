---
name: build-validation
description: Compile a proto-ready vision into one prototype validation target. Use when the user invokes /ow:validation, asks what the prototype must prove first, or needs to turn product intent into an experiment brief before /ow:proto.
---

# Build Validation

## Purpose

Turn proto-ready vision into a single prototype validation target.

This skill is the native source behavior for `/ow:validation`. It is not a
feature ranking helper, backlog planner, or prototype generator. It exists
between `/ow:vision` and `/ow:proto` to decide what the next prototype must
prove before prototype prompts are written.

`build-validation` acts as:

- assumption auditor
- experiment designer
- prototype target compiler

It should protect `/ow:proto` from generating attractive prototype directions
that do not reduce the most important product uncertainty.

## Inputs

Required:

- `.openworkflow/vision/VISION_CONTRACT.yaml`
- `.openworkflow/vision/VISION.md` or the active vision session summary

Optional:

- `.openworkflow/context/CONTEXT.md`
- `.openworkflow/context/CONTEXT_MAP.yaml`
- `.openworkflow/context/GLOSSARY.yaml`
- `.openworkflow/validation/VALIDATION_INDEX.yaml`
- `skills/build-validation/references/prototype-validation-target-rubric.md`
- `skills/build-validation/references/return-to-vision-gate.md`

Avoid loading prototype, spec, change, runtime, or implementation artifacts
unless the user explicitly asks to reconcile with historical evidence.

## Core Job

Given a vision, answer:

- What is the central uncertainty that the next prototype must reduce?
- What user behavior would make the product thesis more credible?
- What prototype scene, journey, or interaction must be shown to observe that
  behavior?
- What evidence would count as pass, revise, pivot, stop, or needs_more_evidence?
- What vision gaps make a valid validation target impossible?

If those answers are not available, return to `/ow:vision` instead of forcing a
weak validation target.

## Vision Readiness Gate

Before writing validation artifacts, check that vision provides enough evidence
for:

- target user
- usage context
- current alternative
- desired behavior change
- core mechanism
- differentiator
- trust, privacy, safety, and user-control boundaries
- strongest success signal
- failure signals
- prototype direction seeds
- prompt constraints

When the missing information would cause `/ow:proto` to invent product strategy,
record the gap and hand back to `/ow:vision`.

## Output Contract

Write validation artifacts only when the target is coherent:

```text
.openworkflow/validation/VALIDATION_INDEX.yaml
.openworkflow/validation/<id>/VALIDATION.yaml
.openworkflow/validation/<id>/NOTE.md
```

The validation target should preserve:

```yaml
core_question:
central_uncertainty:
hypothesis:
target_behavior:
prototype_scope:
  include:
  exclude:
prototype_experiment:
  scenario:
  must_show:
  must_not_show:
observable_signals:
  pass:
  fail:
  ambiguous:
decision_rules:
  continue:
  revise:
  pivot:
  stop:
  needs_more_evidence:
vision_gaps:
```

Until the artifact schema formally exposes every field, keep the same
information in the existing `core_question`, `critical_assumptions`,
`prototype_scope`, `acceptance`, and `NOTE.md` fields without losing the
experiment logic.

## Workflow

1. Load current vision and current validation index, if any.
2. Extract the candidate uncertainties from the vision.
3. Rank uncertainties by existential risk, observability in prototype,
   decision leverage, and cost of learning.
4. Select exactly one central uncertainty for the next validation target.
5. Define one minimum prototype experiment.
6. Convert success and failure signals into observable evidence criteria.
7. Define decision rules for continue, revise, pivot, stop, and
   needs_more_evidence.
8. Write validation artifacts only after the target is coherent.

## Prototype Handoff

`/ow:proto` should be able to consume the validation target as an experiment
brief. It should not need to infer:

- which uncertainty matters most
- which screen or journey moments are required
- which user behavior is being observed
- which anti-goals and trust boundaries constrain the prototype
- what evidence changes the next decision

When validation is present, `/ow:proto` should treat it as the target of the
prototype prompt pack.

## Forbidden Defaults

- Do not generate prototype prompts.
- Do not create prototype images or prototype evidence.
- Do not produce production specs, changes, tasks, or implementation plans.
- Do not turn supporting features into blockers for the central uncertainty.
- Do not select multiple unrelated validation targets in one artifact.
- Do not hide vision gaps by writing a polished but unsupported target.

## Handoff

Hand off to `/ow:proto` only when the validation target names a central
uncertainty, prototype scope, observable evidence, and decision rules.

Hand back to `/ow:vision` when the target would require inventing product
strategy.
