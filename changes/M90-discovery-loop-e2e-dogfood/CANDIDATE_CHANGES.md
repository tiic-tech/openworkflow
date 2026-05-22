# M90 Discovery-Loop E2E Dogfood

Source of truth: `CANDIDATE_CHANGES.yaml`

Status: active

Branch boundary: `codex/m73-workflow-blueprint-runtime-alignment`

## Scope

Add a synchronous, text-first dogfood verification slice for the upgraded
discovery loop: proto-ready vision, validation, strategic prompt pack,
prompt2proto metadata, tune refined prompt pack, and benchmark-selection
readiness.

This queue does not include async subagents, real image generation, visual diff
tooling, proto2html, html2spec, build, or archive.

## Candidates

| ID | Status | Risk | Title | Dependencies |
| --- | --- | --- | --- | --- |
| C001 | selected | medium | Create canonical discovery-loop dogfood fixture | none |
| C002 | candidate | medium | Verify happy-path discovery-loop command handoff | C001 |
| C003 | candidate | medium | Verify discovery-loop failure routing | C001, C002 |
| C004 | candidate | medium | Record benchmark-selection readiness evidence | C001, C002, C003 |

## Next Recommendation

`C001` is selected. It creates the canonical fixture all later M90 E2E checks
depend on.

## Deferred

- `M89-built-in-agent-team-internal-stages`
- `M91-proto2html-benchmark-input`
- `M92-visual-generation-dogfood-harness`
