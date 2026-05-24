# C005 Implementation Brief

## Goal

Replay the real `smart_city_copilot` target prompt pack with M100 paragraph
quality gates enabled, and prove the prompt text now reads like a complete
dailin-grade prototype-generation brief rather than a terse screen-state image
instruction.

## Read First

- `changes/M100-dailin-grade-image-prompt-paragraphs/C005-replay-smart-city-copilot-with-dailin-grade-prompt-paragraphs/SELECTED_CHANGE.yaml`
- `/tmp/smart-city-m99-e2e-worktree/.openworkflow/prototypes/proto-001/PROTO_PROMPT_PACK.yaml`
- `/tmp/smart-city-m99-e2e-worktree/.openworkflow/prototypes/proto-001/EVIDENCE.yaml`
- `/tmp/smart-city-m99-e2e-worktree/.openworkflow/prototypes/proto-001/SUMMARY.yaml`

## Do

- Confirm the old target replay fails M100 prompt paragraph validation.
- Upgrade the target direction `prototype_prompt` into a long-form generation
  brief with product context, target user, journey, system behavior, concrete
  copy/data, trust controls, anti-goals, visual direction, and desired feeling.
- Upgrade every target `screen_prompts[].prompt` into a dailin-grade screen
  generation brief with journey stage and acceptance signal.
- Add paragraph-quality readiness evidence to `prompt_text_manifest` and
  `quality_rubric`.
- Validate target replay and record target commit evidence.

## Do Not

- Do not run provider-backed image generation.
- Do not perform human visual review.
- Do not score visual reference parity.
- Do not implement proto2html.
- Do not implement M101 command split.

## Validation

- `node /Users/archy/Projects/StartUp/openworkflow/dist/cli/src/index.js validate --root /tmp/smart-city-m99-e2e-worktree --json`
- `node /Users/archy/Projects/StartUp/openworkflow/dist/cli/src/index.js summaries --root /tmp/smart-city-m99-e2e-worktree --strict --json`
- `node /Users/archy/Projects/StartUp/openworkflow/dist/cli/src/index.js handoff --root /tmp/smart-city-m99-e2e-worktree --json`
- `git diff --check`
