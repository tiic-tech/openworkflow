# M100 Dailin-Grade Image Prompt Paragraphs

Source of truth: `CANDIDATE_CHANGES.yaml`

Status: active

Branch boundary: `codex/m100-dailin-grade-image-prompt-paragraphs`

## Scope

Upgrade `/ow:vision2prompt` so the actual prompt paragraphs used for image
generation match or exceed dailin `OUTPUT_PROMPT.md`. This queue is about prompt
text quality, not just YAML field completeness.

The foundation is dailin
`DISTILLED_SKILLS/vision_to_strategic_prototype_prompt/SKILL.md`, especially its
step-by-step reference files:

- `01_input_contract.md`
- `02_vision_decomposition.md`
- `03_strategy_hypothesis_generation.md`
- `04_prototype_prompt_schema.md`
- `05_output_templates.md`
- `06_quality_rubric.md`

`OUTPUT_PROMPT.md` is the concrete output bar; the SKILL and references are the
method that gets OW there.

In scope:

- direction-level and screen-level generation prompt paragraph quality
- paragraph anatomy, quality rubric, schema/validator gates, generated
  `/ow:vision2prompt` guidance, runtime fixtures, and target replay evidence

Out of scope:

- provider-backed image generation
- human visual review
- visual reference parity scoring
- proto2html
- storyboard and motion modeling

## Why This Queue Exists

M98 and M99 proved source completeness: the prompt pack now contains
`prototype_brief`, `product_experience_model`, `screen_manifest`,
`screen_prompts`, negative prompts, quality rubric, integrity gate, and reality
gate.

The remaining failure is stricter: the prompt text itself is still too short.
M99 smart city prompts are mostly terse screen-state instructions, while dailin
`OUTPUT_PROMPT.md` reads like a complete high-fidelity prototype-generation
brief with journey, interaction behavior, system response, trust controls,
anti-goals, visual direction, and user feeling.

## Selection Policy

Next recommended candidate: `C002`

Select the first dependency-free candidate that most directly turns the dailin
quality target into enforceable OpenWorkflow prompt-generation behavior. Stop
for a high-risk report if the work expands into provider generation, visual
review, proto2html, or broad workflow redesign.

## Candidates

| ID | Status | Risk | Title | Dependencies |
| --- | --- | --- | --- | --- |
| C001 | done | medium | Map dailin skill workflow into OW prompt paragraph contract | none |
| C002 | ready | medium | Enforce long-form generation prompt structure in schemas and validators | C001 |
| C003 | candidate | medium | Wire dailin-grade prompt paragraph generation into /ow:vision2prompt | C001, C002 |
| C004 | candidate | medium | Add dailin-grade prompt fixtures and thin-prompt regressions | C002, C003 |
| C005 | candidate | medium | Replay smart_city_copilot with dailin-grade prompt paragraphs | C003, C004 |
| C006 | candidate | low | Record no-go criteria for future visual parity work | C005 |

## Next Recommendation

`C001` is complete. The next recommended candidate is `C002`, which should turn
the newly mapped prompt paragraph contract into schema and validator
enforcement.

The key acceptance shift is:

- old pass: YAML has `screen_prompts[].prompt`
- new pass: `screen_prompts[].prompt` is a full dailin-grade generation brief
  with journey, interaction behavior, system response, concrete copy/data, trust
  controls, anti-goals, visual direction, and desired user feeling

## Candidate Details

### C001 - Map Dailin Skill Workflow Into OW Prompt Paragraph Contract

Status: done

Purpose: make dailin `vision_to_strategic_prototype_prompt` the source method
for `/ow:vision2prompt`, with `OUTPUT_PROMPT.md` as the minimum prompt paragraph
quality bar.

Evidence:

- `C001-map-dailin-skill-workflow-into-ow-prompt-paragraph-contract/SELECTED_CHANGE.yaml`
- `C001-map-dailin-skill-workflow-into-ow-prompt-paragraph-contract/ATOM_TASKS.yaml`
- `C001-map-dailin-skill-workflow-into-ow-prompt-paragraph-contract/IMPLEMENTATION_BRIEF.md`
- `C001-map-dailin-skill-workflow-into-ow-prompt-paragraph-contract/MAPPING_EVIDENCE.md`

Acceptance:

- OW references mirror dailin steps 1-6: normalize inputs, extract strategic
  core, generate candidate hypotheses, select N directions, write each
  prototype prompt, and recommend build order
- each dailin reference file from `01_input_contract` through
  `06_quality_rubric` has an OW-owned equivalent instruction or mapped
  subsection
- references name dailin OUTPUT_PROMPT as the minimum paragraph benchmark
- prompt schema reference requires long-form generation prompt anatomy
- quality rubric fails terse one-sentence screen prompts
- queue remains scoped to prompt text, not visual parity

### C002 - Enforce Long-Form Generation Prompt Structure In Schemas And Validators

Status: ready

Purpose: make prompt paragraph quality fail closed before
`ready_for_image_generation`.

Acceptance:

- M99-style one-sentence prompts cannot pass readiness
- dailin-style long-form prompt fixture passes
- validation errors identify missing paragraph-quality dimensions

### C003 - Wire Dailin-Grade Prompt Paragraph Generation Into /ow:vision2prompt

Purpose: ensure generated command guidance tells agents to execute the dailin
skill workflow and write dense high-fidelity prototype prompt paragraphs by
default.

Acceptance:

- generated `ow-vision2prompt` requires long-form prompt paragraphs
- handoff to `/ow:prompt2proto` is blocked until paragraph-quality gates pass
- M98 source-completeness gates remain intact

### C004 - Add Dailin-Grade Prompt Fixtures And Thin-Prompt Regressions

Purpose: prevent future regression to terse state prompts.

Acceptance:

- runtime verification rejects old short prompt style
- runtime verification rejects prompt packs that skip strategic core,
  differentiated hypothesis, or build recommendation structure
- runtime verification passes dailin-density prompt packs
- smart city fixture demonstrates the new bar

### C005 - Replay smart_city_copilot With Dailin-Grade Prompt Paragraphs

Purpose: prove the real target repo now emits prompt text comparable to dailin
`OUTPUT_PROMPT.md`.

Acceptance:

- target replay prompt paragraphs contain full product context, journey step,
  screen purpose, components, actions, system response, copy/data, trust
  controls, anti-goals, visual direction, and user feeling
- comparison records prompt text as dailin-grade or better
- image generation remains `not_started`

### C006 - Record No-Go Criteria For Future Visual Parity Work

Purpose: prevent downstream visual work from starting while prompt text is still
thin.

Acceptance:

- handoff report states prompt text go/no-go
- visual parity is allowed only after C005 passes
- no image-generation claim is made

## Deferred

- `M101-provider-image-generation-benchmark`
- `M102-prototype-visual-reference-parity-gate`
- `M103-prototype-storyboard-motion-model`
