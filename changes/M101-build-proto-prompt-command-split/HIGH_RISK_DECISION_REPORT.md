# M101 High-Risk Decision Report

## Decision

Do not implement the split yet. Return to M100 and complete C007 and C003 first.
After that, decide how to split `build-proto-prompt` from `build-prototype`.

## Why High Risk

The split changes command boundaries, generated skills, context packets,
handoff order, runtime-surface assertions, and compatibility for `/ow:proto`.
It is architectural, not just prompt-quality tuning.

## Options

1. Internal split only: keep `/ow:proto` user-facing, add
   `/ow:build-proto-prompt` as an internal compiler stage, and make
   build-prototype consume its artifacts.
2. User-visible split: expose `/ow:build-proto-prompt` and
   `/ow:build-prototype` as separate commands.
3. Alias migration: keep `/ow:vision2prompt` as a temporary alias while the new
   command name becomes primary.

## Recommended Option

Start with option 1. It gives clearer agent responsibilities while preserving
the existing user-facing `/ow:proto` workflow. Evaluate option 3 only if
generated adapters or existing artifacts need a compatibility bridge.

## Guardrails

- Complete M100 C007 and C003 first.
- Do not mix command split implementation with prompt paragraph quality changes.
- Preserve a compatibility path for current `/ow:proto`.
- Update source skills and registry first, then regenerate managed surfaces via
  sync.
- Add runtime-surface assertions for command ordering and artifact handoff.

## Go Criteria

- M100 C007 and C003 are complete.
- A concrete option above is approved.
- The selected candidate has bounded owned paths and validation commands.

## Stop Criteria

- The split requires broad workflow redesign beyond prototype prompt
  compilation and consumption.
- The split would break existing `/ow:proto` without a migration path.
- The work expands into provider image generation, visual review, proto2html,
  storyboard, or motion modeling.
