---
name: build-validation
description: Create validation-first prioritization artifacts from a product vision or change idea. Use when the user asks what should be prioritized, what must be proven first, which feature is core versus supporting, or when a broad idea needs a prototype brief before /ow:change, /ow:team, or implementation work.
---

# Build Validation

## Purpose

Identify the smallest proof needed to make a vision credible before converting
it into implementation scope. This skill ranks assumptions, not backlog tasks.

It answers:

- Which feature is existential to the vision?
- Which features support the core experience?
- Which features are later, operational, or out of scope for validation?
- What is the smallest prototype that can prove or disprove the core assumption?
- What evidence decides whether to continue, pivot, stop, or gather more data?

## Inputs

Read only the relevant upstream contracts:

- `.codex/workflow/WORKFLOW_INDEX.yaml`
- `.codex/workflow/CONTRACT_GRAPH.yaml`
- `.codex/context/CONTEXT_MAP.yaml` when present and relevant
- `.codex/vision/VISION_CONTRACT.yaml` or the user's product vision
- `.codex/decisions/DECISION_INDEX.yaml` when decisions constrain the prototype
- `.codex/spec/SPEC_INDEX.yaml` only for directly relevant binding constraints

Avoid loading archives, unrelated specs, reviews, or runtime state unless the
user asks for historical evidence.

## Output

Write validation artifacts under:

```txt
.codex/validation/<validation_id>/
  VALIDATION.yaml
  PROTOTYPE_BRIEF.md
  RESULT.md
  archive/
```

`RESULT.md` may remain a placeholder until a prototype is tested.

## Workflow

1. Restate the vision in one sentence.
2. Build a feature landscape:
   - `existential`: without this, the vision does not hold
   - `supporting`: makes the core feature useful
   - `later`: valuable after the core assumption is proven
   - `out_of_scope`: explicitly excluded from validation
3. Identify critical assumptions and rank the riskiest first.
4. Define one minimum prototype scope.
5. Define acceptance as evidence questions, not implementation completeness.
6. Initialize artifacts with `scripts/init_validation.py`.
7. Validate with `npm run validate` when the repository validator exists.

## Boundaries

- Do not create full implementation tasks.
- Do not write large product specs.
- Do not solve authentication, persistence, deployment, billing, or admin work
  unless those are the existential assumption.
- Do not treat feature count as progress.
- Prefer a small prototype brief over a broad spec when uncertainty is high.

## Handoff

If validation is planned, hand off to `/ow:prototype` or an implementation
agent with the prototype brief only.

If validation passes, feed `VALIDATION.yaml` and `RESULT.md` into
`/ow:decision`, `/ow:spec`, or `/ow:change`.

If validation fails, revise the vision or create a new validation contract
before generating implementation tasks.
