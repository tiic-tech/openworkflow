# C003 Implementation Brief

## Goal

Extend `PROTO_PROMPT_PACK.yaml` so generation-ready strategic prompt packs carry
screen-bound product prototype instructions in structured fields, not only in
freeform `prototype_prompt` prose.

## Read First

- `changes/M98-dailin-grade-vision2prompt-pipeline/CANDIDATE_CHANGES.yaml`
- `schemas/proto-prompt-pack.schema.json`
- `packages/core/src/validators/validateRepositoryContracts.ts`
- `packages/core/src/validators/validateOpenWorkflow.ts`
- `packages/core/src/workflow/summaryHealth.ts`
- `skills/build-prototype/references/strategic-prompt-pack-protocol.md`

## Do

- Add schema coverage for `prototype_brief`, `direction_map`,
  `screen_manifest`, `global_design_system_prompt`, richer `screen_prompts`,
  and `quality_rubric`.
- Require generation-ready strategic prompt packs to include screen-bound
  manifest and prompt fields.
- Validate that every screen prompt resolves to a `screen_manifest` entry.
- Validate that every screen manifest entry includes components, state/data,
  actions, AI behavior or explicit non-AI rationale, and acceptance criteria.
- Surface executability failures through the existing validation/summary-health
  path where current prompt-pack artifacts are checked.
- Keep refined prompt-pack compatibility intact.
- Record local evidence and update queue status when complete.

## Do Not

- Do not rewrite generated `.agents/**` skill surfaces; C004 owns generated
  protocol wiring.
- Do not add provider-backed image generation, visual parity scoring,
  proto2html, storyboard, or motion modeling.
- Do not broaden this beyond `/ow:vision2prompt` strategic prompt-pack
  executability.

## Owned Paths

- `schemas/proto-prompt-pack.schema.json`
- `packages/core/src/validators/validateRepositoryContracts.ts`
- `packages/core/src/validators/validateOpenWorkflow.ts`
- `packages/core/src/workflow/summaryHealth.ts`
- `packages/cli/src/dev/verifyRuntimeSurface.ts`
- `skills/build-prototype/references/strategic-prompt-pack-protocol.md`
- `changes/M98-dailin-grade-vision2prompt-pipeline/`

## Validation

- `npm run build`
- `npm run validate`
- `npm run verify:runtime-surface`
- `node dist/cli/src/index.js validate --root . --json`
- `node dist/cli/src/index.js summaries --root . --strict --json`
- `git diff --check`

## Stop Conditions

- Stop if generated skill protocol rewriting is required before the contract can
  be expressed; defer that to C004.
- Stop if refined `/ow:tune` prompt-pack compatibility would require a broad
  redesign.
- Stop if the implementation needs remote operations, provider-backed image
  calls, visual review, or release publishing.
