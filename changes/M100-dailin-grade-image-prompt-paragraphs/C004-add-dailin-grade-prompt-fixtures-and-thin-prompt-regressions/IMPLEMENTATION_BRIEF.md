# C004 Implementation Brief

## Goal

Prove M100 prompt paragraph quality with runtime fixtures: dailin-density
positive, smart-city positive, terse screen-state negative, and long-form but
strategyless negative.

## Read First

- `packages/cli/src/dev/verifyRuntimeSurface.ts`
- `examples/m98-dailin-grade-fixtures/README.md`
- `examples/m98-smart-city-replay/PROTO_PROMPT_PACK.yaml`
- `changes/M100-dailin-grade-image-prompt-paragraphs/C004-add-dailin-grade-prompt-fixtures-and-thin-prompt-regressions/SELECTED_CHANGE.yaml`

## Do

- Add explicit paragraph-quality manifest and rubric evidence to positive
  fixture generators.
- Preserve the M98 smart city replay as a negative example for old prompt text.
- Add or document a smart city dailin-grade positive runtime fixture.
- Add a long-form negative fixture that omits strategic core or build
  recommendation despite having verbose prompt text.
- Assert pass/fail behavior in `npm run verify:runtime-surface`.

## Do Not

- Do not run provider-backed image generation.
- Do not perform human visual review.
- Do not mutate target repos.
- Do not implement M101 command split.

## Validation

- `npm run build`
- `npm run verify:runtime-surface`
- `node dist/cli/src/index.js validate --root . --json`
- `node dist/cli/src/index.js summaries --root . --strict --json`
- `git diff --check`
