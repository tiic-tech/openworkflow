# M101 Build-Proto-Prompt Command Split

Source of truth: `CANDIDATE_CHANGES.yaml`

Status: active

Branch boundary: `codex/m101-build-proto-prompt-command-split`

## Scope

Split the current prototype command responsibility into two focused surfaces:

- `build-proto-prompt`: compile ready vision and validation into
  `PROTO_PROMPT_PACK` artifacts.
- `build-prototype`: consume ready prompt-pack artifacts and handle downstream
  prototype generation/review evidence.

This queue is intentionally separate from M100. M100 improves prompt paragraph
quality inside the current command surface; M101 may later change the command
surface itself.

## Risk

This is high risk because it changes command registry semantics, generated
skills, managed audit packets, handoff order, runtime verification, and
compatibility for existing `/ow:proto` behavior. Start with
`HIGH_RISK_DECISION_REPORT.md` after M100 C007 and C003 are complete.

## Candidates

| ID | Status | Risk | Title | Dependencies |
| --- | --- | --- | --- | --- |
| C001 | candidate | high | Decide build-proto-prompt split contract and migration guardrails | M100:C007, M100:C003 |
| C002 | candidate | high | Introduce build-proto-prompt command and source skill boundary | C001 |
| C003 | candidate | high | Narrow build-prototype to consume ready prompt-pack artifacts | C001, C002 |

## Next Recommendation

Do not select M101 yet. Return to M100 and complete C007 and C003 first. Then
use C001 to approve a bounded command-split option before implementation.

## Out Of Scope

- provider-backed image generation
- visual review
- proto2html
- storyboard or motion modeling
- changing the M100 prompt paragraph quality rubric
