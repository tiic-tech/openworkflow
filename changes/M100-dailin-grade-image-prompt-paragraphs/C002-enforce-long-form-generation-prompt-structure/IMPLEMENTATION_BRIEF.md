# C002 Implementation Brief

## Goal

Make dailin-grade prompt paragraph quality fail closed before
`prompt_text_manifest.status: ready_for_image_generation`.

This change enforces structure in deterministic validators. It does not judge
generated images or perform visual review.

## Read First

- `changes/M100-dailin-grade-image-prompt-paragraphs/C001-map-dailin-skill-workflow-into-ow-prompt-paragraph-contract/MAPPING_EVIDENCE.md`
- `skills/build-prototype/references/vision2prompt/05_prototype_prompt_schema.md`
- `skills/build-prototype/references/vision2prompt/07_quality_rubric.md`
- `packages/core/src/validators/validateOpenWorkflow.ts`
- `packages/cli/src/dev/verifyRuntimeSurface.ts`

## Do

- Add schema fields for prompt paragraph quality status and dimensions.
- Add validator checks for direction-level `prototype_prompt` and
  screen-level `screen_prompts[].prompt` paragraph anatomy.
- Reject short state-only prompt text when prompt text is marked ready.
- Name missing paragraph-quality dimensions in validation errors.
- Add runtime-surface evidence that long prompt text passes and terse prompt
  text fails.
- Expose paragraph quality status and dimensions in summary-health fields.

## Do Not

- Do not run provider image generation.
- Do not add subjective visual scoring.
- Do not sync generated `.agents/**` or `.openworkflow/**` surfaces.
- Do not replay target repos.
- Do not upgrade stored smart city example fixtures; C004 owns positive fixture
  upgrades.

## Owned Paths

- `schemas/proto-prompt-pack.schema.json`
- `schemas/prototype-evidence.schema.json`
- `packages/core/src/validators/validateOpenWorkflow.ts`
- `packages/core/src/workflow/summaryHealth.ts`
- `packages/cli/src/dev/verifyRuntimeSurface.ts`
- `changes/M100-dailin-grade-image-prompt-paragraphs/`

## Validation

- `npm run build`
- `npm run verify:runtime-surface`
- `node dist/cli/src/index.js validate --root . --json`
- `node dist/cli/src/index.js summaries --root . --strict --json`
- `git diff --check`

## Stop Conditions

- Stop if enforcement needs generated skill sync before C003.
- Stop if the validator would require subjective visual evaluation.
- Stop if target repo replay or provider-backed generation is needed to prove
  C002.
