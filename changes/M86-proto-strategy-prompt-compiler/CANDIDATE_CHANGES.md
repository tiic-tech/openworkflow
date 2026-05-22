# M86 Proto Strategy Prompt Compiler

Status: active

## Scope

Upgrade `/ow:proto` as a strategy-to-prompt compiler. It should consume durable
validation targets and proto-ready vision, extract strategic product structure,
generate distinct prototype directions, and emit image-first prompt packs for
downstream generation and review.

This queue does not include `/ow:tune`, `proto2html`, `html2spec`, generated
prototype images, full discovery-loop read models, or E2E dogfood.

## Candidates

| ID | Status | Risk | Title | Dependencies |
| --- | --- | --- | --- | --- |
| C001 | done | medium | Align native build-prototype strategy compiler contract | none |
| C002 | done | medium | Strengthen strategic prototype prompt-pack artifacts | C001 |
| C003 | done | medium | Upgrade generated `/ow:proto` protocol for strategy-to-prompt compilation | C001, C002 |
| C004 | selected | medium | Add strategic prompt-pack stress fixtures | C001, C002, C003, C005 |
| C005 | done | medium | Define internal proto pipeline and image metadata | C001, C002, C003 |

## Next Recommendation

`C004` is selected. C005 has defined the internal proto pipeline and per-image
metadata, so C004 will test the decomposed command shape rather than the older
monolithic `/ow:proto` behavior.

## Deferred

- `M87-tune-product-system-inheritance`
- `M88-discovery-loop-read-model`
- `M89-discovery-loop-e2e-dogfood`
- `M90-proto2html-benchmark-input`
