# M101 High-Risk Decision Report

## Decision

Do not implement command splitting until C001 approves both the command boundary
and the prompt2proto skill architecture.

M100 is complete, so M101 can start. The first selected candidate must remain
design-only.

## Why High Risk

The split changes command boundaries, generated skills, context packets,
handoff order, runtime-surface assertions, and compatibility for `/ow:proto`.
It is architectural, not just prompt-quality tuning.

The larger risk is that the current `build-prototype` skill contains much of
the vision2prompt depth, while a comparable prompt2proto skill does not yet
exist. If the command split happens first, `build-prototype` becomes a hollow
consumer with no serious method for translating product prompt packs into
credible UI/UX prototype instructions.

## Required Architecture

`build-proto-prompt` should run the vision2prompt method with:

- Co-Founder perspective
- Chief PM / senior product strategist perspective

It owns:

- product thesis and user transformation
- strategic direction generation
- prompt-pack readiness
- cross-screen prototype system coherence contracts

`build-prototype` should run the prompt2proto method with:

- Chief PM perspective
- Principal UI/UX / product design lead perspective

It owns:

- visual translation of ready prompt packs
- information hierarchy
- industry density calibration
- UI/UX prototype credibility
- faithful consumption of system coherence contracts

## Options

1. Internal split only: keep `/ow:proto` user-facing, add
   `/ow:build-proto-prompt` as an internal compiler stage, and make
   build-prototype consume its artifacts through prompt2proto.
2. User-visible split: expose `/ow:build-proto-prompt` and
   `/ow:build-prototype` as separate commands.
3. Alias migration: keep `/ow:vision2prompt` as a temporary alias while the new
   command name becomes primary.

## Recommended Option

Start with option 1. It gives clearer agent responsibilities while preserving
the existing user-facing `/ow:proto` workflow. Evaluate option 3 only if
generated adapters or existing artifacts need a compatibility bridge.

Do not attempt option 1 until prompt2proto design exists. The command split and
the skill architecture are coupled.

## Guardrails

- Keep C001 design-only.
- Design prompt2proto before narrowing build-prototype.
- Treat multi-screen drift as a technical coherence contract owned by
  build-proto-prompt.
- Treat density calibration as Chief PM plus Principal UI/UX judgment owned by
  build-prototype.
- Preserve a compatibility path for current `/ow:proto`.
- Update source skills and registry first, then regenerate managed surfaces via
  sync.
- Add runtime-surface assertions for command ordering, artifact handoff,
  prompt2proto philosophy, coherence, and readiness gates.

## Go Criteria

- M100 is complete.
- C001 approves a concrete split option and prompt2proto architecture.
- C002 designs prompt2proto references before C004 creates the skill foundation.
- The selected implementation candidate has bounded owned paths and validation
  commands.

## Stop Criteria

- The split requires broad workflow redesign beyond prototype prompt
  compilation and prompt2proto consumption.
- The split would break existing `/ow:proto` without a migration path.
- build-prototype would be narrowed before prompt2proto exists.
- The work expands into provider image generation, human visual review, visual
  parity scoring, proto2html, storyboard, or motion modeling.
