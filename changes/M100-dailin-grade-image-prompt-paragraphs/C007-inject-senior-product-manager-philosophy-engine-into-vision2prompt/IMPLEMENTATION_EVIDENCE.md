# C007 Implementation Evidence

## Outcome

C007 injected the co-founder plus senior product-manager perspective engine
into the current `/ow:vision2prompt` prompt compiler before C003 command wiring.
The dailin-derived references are now described as tools for product judgment,
not a checklist whose completion alone proves prompt quality.

## Source Changes

- `skills/build-prototype/SKILL.md` now states that strategic prompt generation
  runs on a co-founder and senior product-manager perspective before reference
  execution.
- `skills/build-prototype/references/strategic-prompt-pack-protocol.md` adds a
  `Perspective Engine` section requiring product thesis, user transformation,
  differentiated form, reason-to-exist, and PM judgment.
- `skills/build-prototype/references/vision2prompt/02_vision_decomposition.md`
  carries product thesis, user transformation, and form point of view from
  decomposition into prompt generation.
- `skills/build-prototype/references/vision2prompt/03_strategy_hypothesis_generation.md`
  penalizes screen-inventory candidates that lack product thesis or
  reason-to-exist.
- `skills/build-prototype/references/vision2prompt/05_prototype_prompt_schema.md`
  requires prompt paragraphs to explain why the product form deserves to exist,
  not just what UI appears.
- `skills/build-prototype/references/vision2prompt/07_quality_rubric.md` fails
  structurally complete but strategically empty prompt paragraphs.
- `packages/core/src/commands/registry.ts` adds generated
  `perspective_engine` guidance to `/ow:vision2prompt`.
- `packages/cli/src/dev/verifyRuntimeSurface.ts` asserts that generated
  `ow-vision2prompt` includes the perspective engine.

## Generated Evidence

`node dist/cli/src/index.js sync --root . --json` regenerated:

- `.agents/skills/ow-vision2prompt/SKILL.md`
- `.openworkflow/audit/CONTEXT_PACKETS.yaml`

## Validation

- `npm run build`
- `node dist/cli/src/index.js sync --root . --json`
- `npm run verify:runtime-surface`

Final queue validation was run after updating completion artifacts.
