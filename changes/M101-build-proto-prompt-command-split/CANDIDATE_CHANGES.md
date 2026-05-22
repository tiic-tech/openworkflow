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
| C001 | done | high | Decide command split, prompt2proto skill architecture, and migration guardrails | none |
| C002 | done | high | Design prompt2proto skill contract and reference architecture | C001 |
| C003 | done | high | Introduce build-proto-prompt command and source skill boundary | C001 |
| C004 | done | high | Create prompt2proto source skill foundation | C001, C002 |
| C005 | done | high | Add prototype system coherence contract to build-proto-prompt | C001, C003 |
| C006 | ready | high | Inject Chief PM and Principal UI/UX philosophy engine into build-prototype | C001, C002, C004 |
| C007 | candidate | high | Narrow build-prototype to consume ready prompt-pack artifacts through prompt2proto | C001, C003, C004, C005, C006 |

## Current Status

M100 is complete and `C001` is done as the high-risk design-only gate.
The approved migration direction remains option 1 from the decision report:
preserve `/ow:proto` as the user-facing orchestration surface, introduce
`build-proto-prompt` as the prompt-pack compiler stage, and narrow
`build-prototype` only after prompt2proto has a comparable skill contract and
foundation.

`C002` is done with a prompt2proto skill contract and reference architecture.
`C004` is done with a new source skill foundation under `skills/prompt2proto/`,
created using the user-requested `skill_generator` method: role engine first,
lean skill shell, numbered references, and internal validation boundaries.
`C003` is done with a new internal `/ow:build-proto-prompt` command, source
skill boundary, generated Codex skill, command audit/context packet updates,
and runtime-surface assertions.
`C005` is done with `prototype_system_contract` added as the technical
multi-screen coherence contract for ready prompt packs. The contract is now in
schemas, artifact templates, validators, source skill guidance, generated
skills, context packets, and runtime-surface fixtures.

Current completed artifacts:

- `C001-decide-command-split-prompt2proto-skill-architecture-and-migration-guardrails/SELECTED_CHANGE.yaml`
- `C001-decide-command-split-prompt2proto-skill-architecture-and-migration-guardrails/ATOM_TASKS.yaml`
- `C001-decide-command-split-prompt2proto-skill-architecture-and-migration-guardrails/IMPLEMENTATION_BRIEF.md`
- `C002-design-prompt2proto-skill-contract-and-reference-architecture/PROMPT2PROTO_SKILL_DESIGN.md`
- `C003-introduce-build-proto-prompt-command-and-source-skill-boundary/IMPLEMENTATION_EVIDENCE.md`
- `C004-create-prompt2proto-source-skill-foundation/IMPLEMENTATION_EVIDENCE.md`
- `C005-add-prototype-system-coherence-contract-to-build-proto-prompt/IMPLEMENTATION_EVIDENCE.md`
- `skills/build-proto-prompt/SKILL.md`
- `skills/prompt2proto/SKILL.md`

The C005 managed `.agents/**` and `.openworkflow/audit/**` updates were
regenerated from source by `node dist/cli/src/index.js sync --root . --json`.

## Next Recommendation

Select `C006` next to wire the Chief PM plus Principal UI/UX philosophy engine
and density calibration guidance into `build-prototype`. `C007` remains blocked
until C006 is complete.

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
