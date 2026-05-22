# C001 Implementation Brief

## Goal

Map dailin's `vision_to_strategic_prototype_prompt` workflow into
OpenWorkflow-owned `/ow:vision2prompt` prompt paragraph references.

The outcome is a contract-level improvement: generated
`directions[].prototype_prompt` and `screen_prompts[].prompt` text must become
dailin-grade high-fidelity prototype-generation briefs, not terse screen-state
image instructions.

## Read First

- `/Users/archy/Projects/StartUp/dailin/docs/DISTILLED_SKILLS/vision_to_strategic_prototype_prompt/SKILL.md`
- `/Users/archy/Projects/StartUp/dailin/docs/DISTILLED_SKILLS/vision_to_strategic_prototype_prompt/reference/01_input_contract.md`
- `/Users/archy/Projects/StartUp/dailin/docs/DISTILLED_SKILLS/vision_to_strategic_prototype_prompt/reference/02_vision_decomposition.md`
- `/Users/archy/Projects/StartUp/dailin/docs/DISTILLED_SKILLS/vision_to_strategic_prototype_prompt/reference/03_strategy_hypothesis_generation.md`
- `/Users/archy/Projects/StartUp/dailin/docs/DISTILLED_SKILLS/vision_to_strategic_prototype_prompt/reference/04_prototype_prompt_schema.md`
- `/Users/archy/Projects/StartUp/dailin/docs/DISTILLED_SKILLS/vision_to_strategic_prototype_prompt/reference/05_output_templates.md`
- `/Users/archy/Projects/StartUp/dailin/docs/DISTILLED_SKILLS/vision_to_strategic_prototype_prompt/reference/06_quality_rubric.md`
- `/Users/archy/Projects/StartUp/dailin/docs/OUTPUT_PROMPT.md`
- `skills/build-prototype/references/vision2prompt/`
- `skills/build-prototype/references/strategic-prompt-pack-protocol.md`

## Do

- Map dailin Steps 1-6 into OW's 01-07 reference pipeline.
- Name dailin `OUTPUT_PROMPT.md` as the minimum passing benchmark for prompt
  paragraph density and usefulness.
- Require long-form direction and screen prompt anatomy: product context,
  target user, journey, screens, states, actions, system response, concrete
  copy/data, trust controls, visual direction, anti-goals, acceptance, and
  desired user feeling.
- Add failure language for short state-only prompts.
- Record C001 evidence under the M100 queue.

## Do Not

- Do not change schemas or validators; C002 owns enforcement.
- Do not edit generated `.agents/**` or `.openworkflow/**` surfaces; C003 owns
  generated command wiring.
- Do not add fixtures or replay smart_city_copilot; C004/C005 own that.
- Do not run provider-backed image generation, visual review, proto2html, or
  storyboard/motion modeling.

## Owned Paths

- `skills/build-prototype/references/vision2prompt/01_input_contract.md`
- `skills/build-prototype/references/vision2prompt/02_vision_decomposition.md`
- `skills/build-prototype/references/vision2prompt/03_strategy_hypothesis_generation.md`
- `skills/build-prototype/references/vision2prompt/04_product_system_extraction.md`
- `skills/build-prototype/references/vision2prompt/05_prototype_prompt_schema.md`
- `skills/build-prototype/references/vision2prompt/06_output_templates.md`
- `skills/build-prototype/references/vision2prompt/07_quality_rubric.md`
- `skills/build-prototype/references/strategic-prompt-pack-protocol.md`
- `changes/M100-dailin-grade-image-prompt-paragraphs/`

## Validation

- `rg -n "dailin-grade image prompt|paragraph anatomy|journey|system response|vision_to_strategic_prototype_prompt" skills/build-prototype/references`
- `node dist/cli/src/index.js validate --root . --json`
- `node dist/cli/src/index.js summaries --root . --strict --json`
- `git diff --check`

## Stop Conditions

- Stop if C001 requires schema or validator changes.
- Stop if generated skill sync is required to prove this contract mapping.
- Stop if evidence depends on target repo replay, generated images, human
  visual review, visual parity scoring, proto2html, or storyboard modeling.
