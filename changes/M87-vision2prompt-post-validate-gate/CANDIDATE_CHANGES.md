# M87 Vision2Prompt Post-Validate Gate

Source of truth: `CANDIDATE_CHANGES.yaml`

Status: active

Branch boundary: `codex/m73-workflow-blueprint-runtime-alignment`

## Scope

Add a post-validate gate for prompt assets produced by internal
`/ow:vision2prompt` before handoff to `/ow:prompt2proto`.

This queue is limited to strategic fingerprint diversity validation for prompt
assets. It does not include `/ow:tune`, async subagent execution, external image
generation, proto2html, or full discovery-loop E2E dogfood.

Important rule: when the user explicitly requests exactly one strategic
direction, the diversity gate is skipped and the skipped outcome is recorded.
When the requested or resolved direction count is 2 or more, post-validate must
run before `/ow:prompt2proto`.

## Candidates

| ID | Status | Risk | Title | Dependencies |
| --- | --- | --- | --- | --- |
| C001 | done | medium | Define prompt asset post-validate contract | none |
| C002 | selected | medium | Implement deterministic strategic fingerprint evaluator | C001 |
| C003 | candidate | medium | Wire post-validate gate into generated vision2prompt protocol | C001, C002 |
| C004 | candidate | medium | Add post-validate stress fixtures | C001, C002, C003 |

## Next Recommendation

`C002` is selected. C001 defined the artifact contract and skip/pass/fail
semantics needed before algorithm or generated protocol work.

## Deferred

- `M88-tune-product-system-inheritance`
- `M89-built-in-agent-team-internal-stages`
- `M90-discovery-loop-e2e-dogfood`
