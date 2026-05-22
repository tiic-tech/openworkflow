# C005 Implementation Evidence

## Outcome

C005 completed the real smart city target replay with dailin-grade prompt
paragraphs. The target replay now passes M100 prompt paragraph validation while
keeping provider-backed image generation out of scope.

Target commit:

- `/tmp/smart-city-m99-e2e-worktree`
- branch: `codex/m99-smart-city-m98-e2e-replay`
- commit: `66f6a38 Replay smart city with dailin grade prompts`

## Baseline Failure

Before the replay upgrade, the target prompt pack was source-complete but failed
M100 paragraph quality validation. The validator reported missing dimensions on
the direction prompt, including `minimum_substance`, `target_user`, and
`anti_goals`, and missing screen prompt dimensions such as
`minimum_substance`, `journey_or_screen_purpose`, and `negative_constraints`.

This matches the M99 conclusion: the real replay had enough YAML fields, but
the prompt paragraphs still read like short screen-state image instructions.

## Target Changes

- Added `quality_rubric.prompt_paragraph_quality` to both target
  `PROTO_PROMPT_PACK.yaml` and `EVIDENCE.yaml`.
- Added direction-level `product_thesis`, `user_transformation`, and
  `reason_to_exist`.
- Rewrote the direction `prototype_prompt` into a full CityFlow Copilot
  generation brief for a map-first smart city operations product.
- Rewrote all four target screen prompts:
  - `map-shell`
  - `planning-review`
  - `incident-response`
  - `capacity-monitor`
- Added `prompt_text_manifest.paragraph_quality_status: pass` and the full
  paragraph-quality dimension list.

## Comparison Result

The upgraded target replay is dailin-grade on prompt paragraph density and
generation usefulness:

- It names the product, target user, workflow journey, map-first product form,
  system response, trust controls, concrete city data, visual structure,
  anti-goals, and desired operator feeling.
- Each screen prompt now describes why the screen exists in the user journey,
  what the operator does, what the system reveals or blocks, and what concrete
  copy/data should appear.
- The direction carries strategic product judgment rather than only screen
  inventory: it explains why map-first AI credibility matters, what user
  transformation is being tested, and why the prototype should exist.

The comparison is text-only by design. No provider-backed image generation,
human visual review, visual reference parity scoring, proto2html, storyboard,
or motion modeling was performed.

## Validation

- `node /Users/archy/Projects/StartUp/openworkflow/dist/cli/src/index.js validate --root /tmp/smart-city-m99-e2e-worktree --json` passed.
- `node /Users/archy/Projects/StartUp/openworkflow/dist/cli/src/index.js summaries --root /tmp/smart-city-m99-e2e-worktree --strict --json` passed.
- `node /Users/archy/Projects/StartUp/openworkflow/dist/cli/src/index.js handoff --root /tmp/smart-city-m99-e2e-worktree --json` passed.
- `git diff --check` passed in the target worktree.
- Target `image_generation.status` remains `not_started`.

Final queue validation was run after updating completion artifacts.
