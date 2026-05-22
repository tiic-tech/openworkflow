# C007 Implementation Brief

## Goal

Inject a co-founder and senior product-manager perspective engine into
`/ow:vision2prompt` before C003 wires paragraph generation. The system should
use the dailin-derived references as tools, while the actual generative engine
is strategic product judgment, differentiated product imagination, and design
philosophy.

## Read First

- `changes/M100-dailin-grade-image-prompt-paragraphs/C007-inject-senior-product-manager-philosophy-engine-into-vision2prompt/SELECTED_CHANGE.yaml`
- `skills/build-prototype/SKILL.md`
- `skills/build-prototype/references/strategic-prompt-pack-protocol.md`
- `skills/build-prototype/references/vision2prompt/02_vision_decomposition.md`
- `skills/build-prototype/references/vision2prompt/03_strategy_hypothesis_generation.md`
- `skills/build-prototype/references/vision2prompt/05_prototype_prompt_schema.md`
- `skills/build-prototype/references/vision2prompt/07_quality_rubric.md`
- `packages/core/src/commands/registry.ts`
- `packages/cli/src/dev/verifyRuntimeSurface.ts`

## Do

- Add an explicit Step 0 perspective engine to `/ow:vision2prompt`: act as a
  co-founder and senior product manager before executing references.
- State that the dailin-derived references are tools, not the source of taste by
  themselves.
- Require product thesis, user transformation, differentiated product form, and
  reason-to-exist for each prototype direction.
- Add anti-default guidance against reflexively producing dashboards, SaaS
  shells, or screen inventories when the vision calls for another form.
- Extend runtime-surface assertions so generated guidance cannot omit the
  perspective engine.

## Do Not

- Do not run provider-backed image generation.
- Do not make visual review or visual parity claims.
- Do not add proto2html, storyboard, or motion modeling.
- Do not manually patch generated `.agents/**` or `.openworkflow/**` surfaces;
  update sources and run sync.

## Owned Paths

- `packages/core/src/commands/registry.ts`
- `skills/build-prototype/SKILL.md`
- `skills/build-prototype/references/strategic-prompt-pack-protocol.md`
- `skills/build-prototype/references/vision2prompt/02_vision_decomposition.md`
- `skills/build-prototype/references/vision2prompt/03_strategy_hypothesis_generation.md`
- `skills/build-prototype/references/vision2prompt/05_prototype_prompt_schema.md`
- `skills/build-prototype/references/vision2prompt/07_quality_rubric.md`
- `.agents/skills/ow-vision2prompt/SKILL.md`
- `.openworkflow/audit/CONTEXT_PACKETS.yaml`
- `packages/cli/src/dev/verifyRuntimeSurface.ts`
- `changes/M100-dailin-grade-image-prompt-paragraphs/`

## Validation

- `npm run build`
- `node dist/cli/src/index.js sync --root . --json`
- `npm run verify:runtime-surface`
- `node dist/cli/src/index.js validate --root . --json`
- `node dist/cli/src/index.js summaries --root . --strict --json`
- `git diff --check`

## Stop Conditions

- Stop if the change expands into provider image generation, visual review,
  proto2html, storyboard, motion modeling, or unrelated command surfaces.
- Stop if generated-surface changes cannot be produced by source edits plus
  `openworkflow sync`.
