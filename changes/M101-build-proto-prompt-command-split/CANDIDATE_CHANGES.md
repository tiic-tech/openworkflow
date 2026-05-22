# M101 Build-Proto-Prompt Command Split

Source of truth: `CANDIDATE_CHANGES.yaml`

Status: active

Branch boundary: `codex/m101-build-proto-prompt-command-split`

## Scope

Split the current prototype command responsibility into two focused surfaces:

- `build-proto-prompt`: compile ready vision and validation into
  `PROTO_PROMPT_PACK` artifacts.
- `build-prototype`: consume ready prompt-pack artifacts through a new
  prompt2proto skill and handle downstream visual prototype instructions,
  evidence, and review-ready outputs.

This queue now includes the missing prerequisite the user identified:
`prompt2proto` does not yet exist at the same quality level as `vision2prompt`.
M101 must design and create that skill before narrowing `build-prototype`.

## Role Engines

`build-proto-prompt` loads the vision2prompt method and runs on:

- Co-Founder perspective
- Chief PM / senior product strategist perspective

It owns product strategy, product/user fusion, direction hypotheses, prompt
pack readiness, and cross-screen system contracts.

`build-prototype` loads the prompt2proto method and runs on:

- Chief PM perspective
- Principal UI/UX / product design lead perspective

It owns visual translation, information hierarchy, industry density judgment,
prototype credibility, and faithful consumption of ready prompt-pack artifacts.

## Risk

This is high risk because it changes command registry semantics, generated
skills, managed audit packets, handoff order, runtime verification, and
compatibility for existing `/ow:proto` behavior.

It is also high risk because `build-prototype` cannot simply become a shell
around generated images. It needs a real prompt2proto skill with reference
quality comparable to the M100 vision2prompt skill.

## Candidates

| ID | Status | Risk | Title | Dependencies |
| --- | --- | --- | --- | --- |
| C001 | ready | high | Decide command split, prompt2proto skill architecture, and migration guardrails | none |
| C002 | candidate | high | Design prompt2proto skill contract and reference architecture | C001 |
| C003 | candidate | high | Introduce build-proto-prompt command and source skill boundary | C001 |
| C004 | candidate | high | Create prompt2proto source skill foundation | C001, C002 |
| C005 | candidate | high | Add prototype system coherence contract to build-proto-prompt | C001, C003 |
| C006 | candidate | high | Inject Chief PM and Principal UI/UX philosophy engine into build-prototype | C001, C002, C004 |
| C007 | candidate | high | Narrow build-prototype to consume ready prompt-pack artifacts through prompt2proto | C001, C003, C004, C005, C006 |

## Next Recommendation

M100 is complete. Select `C001` next, but keep it design-only. C001 should
approve the command split option, the prompt2proto skill architecture, and the
migration guardrails before any source skill, registry, generated adapter, or
managed audit surface changes.

## Key Split

Multi-screen drift is a technical consistency problem. It belongs in
`build-proto-prompt` as a prototype system or screen coherence contract.

Density calibration is a design judgment problem. It belongs in
`build-prototype` through the Chief PM plus Principal UI/UX philosophy engine,
where industry practice, task risk, screen size, user role, and information
hierarchy are considered before visual translation.

## Out Of Scope

- provider-backed image generation implementation
- human visual review
- visual reference parity scoring
- proto2html
- storyboard or motion modeling
- changing the completed M100 prompt paragraph quality content
