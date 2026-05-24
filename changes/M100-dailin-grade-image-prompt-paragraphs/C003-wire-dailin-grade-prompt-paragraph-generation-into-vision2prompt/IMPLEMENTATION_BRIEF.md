# C003 Implementation Brief

## Goal

Wire the dailin-grade prompt paragraph contract into generated
`/ow:vision2prompt` guidance and downstream prompt2proto handoff behavior.
After C003, an agent should not be able to hand off terse screen-state prompts
or structurally complete but low-density prompt paragraphs.

## Read First

- `changes/M100-dailin-grade-image-prompt-paragraphs/C003-wire-dailin-grade-prompt-paragraph-generation-into-vision2prompt/SELECTED_CHANGE.yaml`
- `packages/core/src/commands/registry.ts`
- `skills/build-prototype/SKILL.md`
- `skills/build-prototype/references/strategic-prompt-pack-protocol.md`
- `skills/build-prototype/references/vision2prompt/05_prototype_prompt_schema.md`
- `skills/build-prototype/references/vision2prompt/07_quality_rubric.md`
- `packages/cli/src/dev/verifyRuntimeSurface.ts`

## Do

- Require generated `/ow:vision2prompt` guidance to run the OW dailin-mapped
  references in order before writing prompt paragraphs.
- Require long-form paragraph text that carries journey, interaction behavior,
  system response, concrete content, trust controls, anti-goals, visual
  direction, desired user feeling, and the C007 perspective engine.
- Require paragraph-quality gates before `/ow:prompt2proto` handoff.
- Regenerate managed surfaces via sync and assert generated guidance in
  runtime-surface verification.

## Do Not

- Do not run provider-backed image generation.
- Do not create visual review artifacts.
- Do not add proto2html.
- Do not implement the M101 command split.

## Validation

- `npm run build`
- `node dist/cli/src/index.js sync --root . --json`
- `npm run verify:runtime-surface`
- `node dist/cli/src/index.js validate --root . --json`
- `node dist/cli/src/index.js summaries --root . --strict --json`
- `git diff --check`
