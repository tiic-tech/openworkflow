---
name: tune-prototype
description: Refine accepted prototype screens or prompt packs into screen-bound refined prototype prompt packs. Use when the user wants /ow:tune to preserve a baseline prototype product system while applying feedback, form-factor changes, screen-specific edits, or regeneration instructions before production planning.
---

# Tune Prototype

## Purpose

Convert accepted baseline prototype evidence and tuning feedback into a refined
prompt pack without product drift. This skill is the source behavior for
`/ow:tune`; it does not create first-pass strategic prototype directions and it
does not implement production code.

Tune work answers: how should an already accepted prototype screen group change
while preserving the product system that made it worth accepting?

## Inputs

Required:

- baseline prototype screens, screenshots, screen descriptions, generated image
  outputs, or an accepted `PROTO_PROMPT_PACK.yaml`
- direct user tune/refinement request

Optional:

- baseline prompt pack or prior `REFINED_PROTO_PROMPT_PACK.yaml`
- product vision or selected strategic direction
- screen map, accepted direction, locked screens, target form factor, target
  screen count, target tool, regeneration scope, output language, or constraints
- `references/proto-redesign-artifact-contracts.md`
- `skills/tune-prototype/references/refined-prompt-pack-protocol.md`

Do not load unrelated specs, changes, runtime state, generated adapters, or
production implementation history unless the tuning question explicitly depends
on them.

## Output

Write artifacts under the active prototype or change path chosen by the
workflow. The core artifact is a refined proto prompt pack matching
`schemas/proto-prompt-pack.schema.json`.

Expected files:

```txt
REFINED_PROTO_PROMPT_PACK.yaml
REFINED_PROTO_PROMPT_PACK.md
REVIEW_PLAN.md
EVIDENCE.md
```

## Workflow

1. Normalize baseline inputs: screen captures, screen descriptions, accepted
   prompt pack, previous generated prompts, target tool, target form factor,
   locked screens, and regeneration scope.
2. Audit the full baseline screen group before writing prompts. Do not tune
   from one representative screen unless the user explicitly limits scope.
3. Extract the product system: thesis, primary loop, interaction model, feature
   system, design language, copy rules, trust boundaries, anti-goals, stable
   constants, and adaptable variables.
4. Interpret the tune request as explicit additions, removals, transformations,
   locked elements, and flexible areas. Surface conflicts or assumptions
   briefly.
5. Create `MUST_INHERIT`, `MUST_ADD`, `MUST_REMOVE`, and `FLEXIBLE_CHANGE`
   rules, then apply them globally and per target screen.
6. Build a screen mapping and prompt manifest with stable target screen IDs,
   source screen IDs, generation order, dependencies, negative constraints, and
   acceptance criteria.
7. Write a global design system prompt and standalone screen-specific prompts.
8. Review the pack against product continuity, screen binding, deletion
   coverage, trust/privacy preservation, and downstream generation readiness.
9. Run `npm run validate` when the repository validator exists.

## Refinement Rules

- Treat a prototype screen group as a product system, not a collection of
  unrelated images.
- Preserve product thesis, primary loop, core feature logic, emotional promise,
  component vocabulary, copy tone, AI/system behavior, trust boundaries, and
  user controls unless the user explicitly changes them.
- Bind every refined prompt to a target screen ID, source screen ID(s),
  generation scope, target form factor, and acceptance criteria.
- Put requested removals in `MUST_REMOVE`, global negative constraints,
  per-screen negative constraints, and acceptance checks.
- Platform transformation should preserve intent over geometry. For example,
  desktop outputs need native navigation, information density, and layout
  patterns rather than widened mobile screens.
- Multi-round tuning must import prior accepted `MUST_INHERIT` rules and keep
  screen IDs stable unless screens are split, merged, deleted, or explicitly
  renamed.
- Do not introduce unrelated features, a new product model, or a new brand
  direction unless the tune request explicitly asks for that.

## Forbidden Defaults

- Do not create first-pass strategic prototype directions; use
  `build-prototype` for `/ow:proto`.
- Do not create `SPEC.yaml`, `CHANGE.yaml`, `.codex/runtime/`, or Agent Team
  artifacts from this skill.
- Do not add `/ow:proto2html` or any HTML conversion behavior.
- Do not expose runtime command surfaces or generated adapter surfaces.
- Do not silently drop accepted baseline controls, privacy affordances, memory
  controls, or non-goals during visual refinement.
- Do not output anonymous refined prompts that cannot be traced back to source
  and target screens.

## Handoff

After user review, hand off to `/ow:decision`, another `/ow:tune` round,
design/spec planning, or another candidate change.

Expected outcomes:

- `continue`: refined prompt pack is strong enough for production planning
- `tune`: another refinement pass is needed
- `regenerate_selected`: selected screens need another image generation pass
- `pivot`: adjust the strategic prototype direction or vision
- `stop`: archive or clean the prototype path
