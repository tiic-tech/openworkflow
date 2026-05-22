# C002 Implementation Brief

## Goal

Migrate dailin's `vision_to_strategic_prototype_prompt` method into
OpenWorkflow-owned `/ow:vision2prompt` references.

The outcome is a durable reference pipeline that agents can execute before
writing `PROTO_PROMPT_PACK.yaml` and `.md`.

## Read First

- `/Users/archy/Projects/StartUp/dailin/docs/DISTILLED_SKILLS/vision_to_strategic_prototype_prompt/SKILL.md`
- `/Users/archy/Projects/StartUp/dailin/docs/DISTILLED_SKILLS/vision_to_strategic_prototype_prompt/reference/`
- `skills/build-prototype/references/strategic-prompt-pack-protocol.md`
- `changes/M98-dailin-grade-vision2prompt-pipeline/CANDIDATE_CHANGES.yaml`

## Do

- Create `skills/build-prototype/references/vision2prompt/`.
- Add OW-native references for input normalization, vision decomposition,
  hypothesis generation, product system extraction, prototype prompt schema,
  output templates, and quality rubric.
- Preserve the dailin method's execution density: strategy before UI, distinct
  hypotheses, screen groups, states, interactions, concrete copy/data, AI/system
  behavior, trust controls, anti-goals, and PM recommendation.
- Remove English Friend-specific assumptions from the generic references.
- Update `strategic-prompt-pack-protocol.md` to require this pipeline before
  prompt text can be marked ready.

## Do Not

- Do not change schemas or validators; C003 and later candidates own that.
- Do not edit generated `.agents/**` or `.openworkflow/**` surfaces.
- Do not add smart city replay fixtures; C006 owns that.
- Do not add provider image generation, visual review, storyboard, reference
  ingestion, or proto2html behavior.

## Owned Paths

- `skills/build-prototype/references/vision2prompt/`
- `skills/build-prototype/references/strategic-prompt-pack-protocol.md`
- `changes/M98-dailin-grade-vision2prompt-pipeline/`

## Validation

- `npm run build`
- `npm run validate`
- `rg -n "vision2prompt|dailin-grade|screen_manifest|quality_rubric" skills/build-prototype/references`
- `git diff --check`

## Stop Conditions

- Stop if reference migration requires schema or validator changes before C003.
- Stop if generated adapter surfaces must be changed before C004.
- Stop if the source references would become domain-specific to English Friend
  instead of generic OW prompt-pack guidance.
