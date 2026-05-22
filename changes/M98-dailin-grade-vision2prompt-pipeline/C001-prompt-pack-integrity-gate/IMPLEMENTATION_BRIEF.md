# C001 Implementation Brief

## Goal

Add a deterministic prompt-pack integrity gate so `PROTO_PROMPT_PACK.yaml`
becomes the trusted source for downstream `/ow:prompt2proto` generation.

The gate should reject prompt packs where direction counts, prompt refs, or
generated image source refs diverge from the actual `directions` and
`screen_prompts` content.

## Read First

- `changes/M98-dailin-grade-vision2prompt-pipeline/CANDIDATE_CHANGES.yaml`
- `schemas/proto-prompt-pack.schema.json`
- `schemas/prototype-evidence.schema.json`
- `packages/core/src/validators/validateRepositoryContracts.ts`
- `packages/core/src/validators/validateOpenWorkflow.ts`
- `packages/core/src/workflow/summaryHealth.ts`
- `packages/cli/src/dev/verifyRuntimeSurface.ts`

## Do

- Add `prompt_pack_integrity_gate` to strategic prompt-pack schema/validation.
- Enforce exact `direction_count_policy.resolved_count` and `directions.length`
  agreement when prompt text is generation-ready.
- Validate `prompt_text_manifest.prompt_text_refs` against existing
  `direction_id` and `screen_prompts[].prompt_id` values.
- Validate `image_generation.generated_images` source refs against existing
  directions and screen prompts when image generation has started.
- Block image generation when the integrity gate fails.
- Add runtime verification coverage for pass and fail cases.
- Record local evidence and update queue status when complete.

## Do Not

- Do not migrate dailin references; C002 owns that.
- Do not expand screen-bound executability fields; C003 owns that.
- Do not edit generated `.agents/**` or `.openworkflow/**` surfaces.
- Do not add provider-backed image generation, visual review, storyboard,
  reference-pattern ingestion, or proto2html behavior.

## Owned Paths

- `schemas/proto-prompt-pack.schema.json`
- `schemas/prototype-evidence.schema.json`
- `packages/core/src/validators/validateRepositoryContracts.ts`
- `packages/core/src/validators/validateOpenWorkflow.ts`
- `packages/core/src/workflow/summaryHealth.ts`
- `packages/cli/src/dev/verifyRuntimeSurface.ts`
- `changes/M98-dailin-grade-vision2prompt-pipeline/`

## Validation

- `npm run build`
- `npm run validate`
- `npm run verify:runtime-surface`
- `node dist/cli/src/index.js validate --root . --json`
- `git diff --check`

## Stop Conditions

- Stop if the change requires broad generated skill protocol rewrites before
  C004.
- Stop if the validator change would break refined `/ow:tune` prompt packs
  without a narrow compatibility path.
- Stop if the implementation needs remote operations, provider-backed image
  calls, or release publishing.
