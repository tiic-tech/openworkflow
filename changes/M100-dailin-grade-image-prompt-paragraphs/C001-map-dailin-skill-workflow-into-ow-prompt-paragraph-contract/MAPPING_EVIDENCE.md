# C001 Mapping Evidence

## Sources

- Dailin skill: `/Users/archy/Projects/StartUp/dailin/docs/DISTILLED_SKILLS/vision_to_strategic_prototype_prompt/SKILL.md`
- Dailin references: `/Users/archy/Projects/StartUp/dailin/docs/DISTILLED_SKILLS/vision_to_strategic_prototype_prompt/reference/01_input_contract.md` through `06_quality_rubric.md`
- Concrete quality bar: `/Users/archy/Projects/StartUp/dailin/docs/OUTPUT_PROMPT.md`
- OW references: `skills/build-prototype/references/vision2prompt/`
- OW protocol: `skills/build-prototype/references/strategic-prompt-pack-protocol.md`

## Step Mapping

| Dailin workflow step | OW-owned mapping |
| --- | --- |
| Step 1: Normalize Inputs | `vision2prompt/01_input_contract.md` now states the dailin input-normalization mapping, durable source-of-truth rule, conservative inference policy, and OUTPUT_PROMPT benchmark dependency. |
| Step 2: Extract Strategic Core | `vision2prompt/02_vision_decomposition.md` now maps the strategic core into fields that must support prompt paragraphs, not generic UI inventory. |
| Step 3: Generate Candidate Strategic Hypotheses | `vision2prompt/03_strategy_hypothesis_generation.md` now states that selected directions must justify different prompt paragraphs, not just different scenarios or visual moods. |
| Step 4: Select N Directions | `vision2prompt/03_strategy_hypothesis_generation.md` owns selection diversity, while `vision2prompt/04_product_system_extraction.md` prevents selected directions from collapsing into isolated screenshots. |
| Step 5: Write Each Prototype Prompt | `vision2prompt/05_prototype_prompt_schema.md` now requires dailin-grade long-form direction and screen prompt anatomy. |
| Step 6: Recommend Build Order | `strategic-prompt-pack-protocol.md` now explicitly lists the dailin Step 1-6 sequence, including build-order recommendation with success and failure signals. |
| Dailin output formatting | `vision2prompt/06_output_templates.md` maps Direction Map, Prototype Prompt, PM Judgment, and Build Recommendation into OW YAML source and Markdown readable view. |
| Dailin final rubric | `vision2prompt/07_quality_rubric.md` now treats OUTPUT_PROMPT as the minimum paragraph density and generation-usefulness benchmark. |

## Paragraph Anatomy Added

C001 defines direction-level `prototype_prompt` as a complete high-fidelity
prototype brief containing:

- product name and positioning;
- target user, usage context, pain, motivation, and behavior change;
- core product mechanism, differentiator, and trust boundary;
- required screen group and journey stages;
- user actions and critical state changes;
- system, AI, workflow, or automation response;
- concrete example copy, data, metrics, domain objects, labels, owners,
  timestamps, or messages;
- trust, privacy, safety, approval, memory, and user-control surfaces;
- visual direction tied to category, primary canvas, component vocabulary, and
  information density;
- anti-goals and desired user feeling.

C001 defines screen-level `screen_prompts[].prompt` as standalone generation
text that must name journey stage, user goal, system state, selected object
when relevant, visible components, example content, primary actions, system
response, trust controls, negative constraints, acceptance criteria, and the
intended user feeling.

## Direct Quality Comparison Note

M99 smart_city replay prompt text was source-complete but still thin: it read
closer to screen-state image instruction than dailin `OUTPUT_PROMPT.md`.
Dailin prompts are stronger because they explain a full product hypothesis,
multi-screen journey, concrete states, interaction behavior, system response,
trust controls, anti-goals, visual direction, and the intended user feeling.

C001 changes the OW reference contract so field presence is no longer treated
as equivalent to prompt paragraph quality. Later candidates can enforce this
with schema, validators, generated skill guidance, fixtures, and replay.

## Out Of Scope Confirmed

C001 did not change schemas, validators, generated `.agents/**` files,
`.openworkflow/**` managed surfaces, runtime fixtures, target repos, provider
image generation, human visual review, visual parity scoring, proto2html, or
storyboard/motion modeling.

## Validation

Passed:

- `rg -n "dailin-grade image prompt|paragraph anatomy|journey|system response|vision_to_strategic_prototype_prompt" skills/build-prototype/references`
- `node dist/cli/src/index.js validate --root . --json`
- `node dist/cli/src/index.js summaries --root . --strict --json`
- `git diff --check`
