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
| C001 | selected | medium | Align native build-prototype strategy compiler contract | none |
| C002 | candidate | medium | Strengthen strategic prototype prompt-pack artifacts | C001 |
| C003 | candidate | medium | Upgrade generated `/ow:proto` protocol for strategy-to-prompt compilation | C001, C002 |
| C004 | candidate | medium | Add strategic prompt-pack stress fixtures | C001, C002, C003 |

## Next Recommendation

`C001` is selected. AC recommended it as the current discovery-loop continuation
after M85; it fixes the native source behavior that the schema and generated
protocol changes should follow.

## Deferred

- `M87-tune-product-system-inheritance`
- `M88-discovery-loop-read-model`
- `M89-discovery-loop-e2e-dogfood`
- `M90-proto2html-benchmark-input`
