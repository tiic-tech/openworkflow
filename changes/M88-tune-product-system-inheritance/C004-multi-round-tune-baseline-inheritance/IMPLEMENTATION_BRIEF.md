# C004 Multi-Round Tune Baseline Inheritance

## Selected Change

Support repeated `/ow:tune` passes by making the refined prompt-pack contract
and generated command protocol identify the latest approved baseline group,
carry forward locked screens and elements, preserve accepted improvements, and
forbid cumulative product drift.

## Scope

In scope:

- Latest approved baseline group fields for refined prompt packs.
- Carry-forward rules for locked screens and locked elements.
- Preservation fields for accepted improvements from previous tune passes.
- Generated `/ow:tune` protocol guidance for multi-round tune behavior.
- Runtime and E2E verification that the generated surface exposes the rule.

Out of scope:

- Async subagent runtime behavior.
- External prototype image generation.
- Visual diff tooling.
- Production design/spec artifacts.

## Implementation Notes

- Keep the artifact text-first and screen-bound.
- Prefer explicit latest-baseline fields over implicit "previous artifact"
  assumptions.
- The rule should be strict by default: prior accepted improvements and locked
  elements carry forward unless the tune input explicitly unlocks or removes
  them.
- Generated `/ow:tune` guidance should make stale source-screen fallback a
  visible anti-pattern.

## Verification

- `npm run build`
- `npm run validate`
- `npm run verify:e2e-workflow`
- `npm run verify:runtime-surface`
- `node dist/cli/src/index.js validate --root . --json`
- `git diff --check`

## Stop Conditions

- Do not introduce async execution or image generation calls.
- Do not broaden into `/ow:proto`, `proto2html`, `html2spec`, or production
  design/spec behavior.
- Stop for approval only if implementation requires high-risk runtime or
  external-service behavior.
