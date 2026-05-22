# M88 Tune Product-System Inheritance

Source of truth: `CANDIDATE_CHANGES.yaml`

Status: active

Branch boundary: `codex/m73-workflow-blueprint-runtime-alignment`

## Scope

Align `/ow:tune` around product-system inheritance and screen-bound refined
prompt packs after prototype image or prompt-pack evidence exists.

This queue absorbs the `prototype_tune_to_refined_prompt` reference skill into
native OW contracts, command protocol, and verification. It does not include
async subagents, external image generation, proto2html, html2spec, production
design/spec work, or full discovery-loop E2E dogfood.

## Candidates

| ID | Status | Risk | Title | Dependencies |
| --- | --- | --- | --- | --- |
| C001 | done | medium | Define refined prompt pack inheritance contract | none |
| C002 | done | medium | Wire reference methodology into `/ow:tune` protocol | C001 |
| C003 | done | medium | Add refined prompt pack validator stress fixtures | C001, C002 |
| C004 | ready | medium | Support multi-round tune baseline inheritance | C001, C002, C003 |

## Next Recommendation

`C004` is ready. It adds latest-baseline and locked-element carry-forward
behavior so repeated `/ow:tune` passes preserve accepted improvements instead
of silently reverting to stale source screens.

## Deferred

- `M89-built-in-agent-team-internal-stages`
- `M90-discovery-loop-e2e-dogfood`
- `M91-proto2html-benchmark-input`
