# C005 Implementation Brief

## Goal

Prove the M98 prompt-pack contract distinguishes dailin-grade executable
product prototype prompt packs from thin image prompts and internally
inconsistent prompt-pack refs.

## Read First

- `changes/M98-dailin-grade-vision2prompt-pipeline/CANDIDATE_CHANGES.yaml`
- `packages/cli/src/dev/verifyRuntimeSurface.ts`
- `packages/cli/src/dev/verifyAgentE2E.ts`
- `skills/build-prototype/references/strategic-prompt-pack-protocol.md`
- `skills/build-prototype/references/vision2prompt/07_quality_rubric.md`

## Do

- Add a named positive dailin-grade fixture modeled on Pocket English Friend.
- Add a thin D1 image-prompt fixture that keeps refs consistent but omits
  screen-bound product states and prompt text.
- Preserve explicit direction-count mismatch and missing prompt-ref regression
  assertions.
- Document the fixture matrix under `examples/` without storing invalid YAML
  that would be picked up by repo-wide validation.
- Record local evidence and update queue status when complete.

## Do Not

- Do not change prompt-pack schema or validator semantics unless an existing
  validator cannot express the C005 acceptance criteria.
- Do not add provider image calls, frontend prototype generation, visual review,
  proto2html, storyboard, or motion modeling.
- Do not store intentionally invalid `.yaml` fixtures under repo paths scanned
  by `npm run validate`.

## Owned Paths

- `packages/cli/src/dev/verifyRuntimeSurface.ts`
- `packages/cli/src/dev/verifyAgentE2E.ts`
- `examples/`
- `changes/M98-dailin-grade-vision2prompt-pipeline/`

## Validation

- `npm run build`
- `npm run verify:runtime-surface`
- `npm run verify:agent-e2e`
- `npm run validate`
- `node dist/cli/src/index.js validate --root . --json`
- `node dist/cli/src/index.js summaries --root . --strict --json`
- `git diff --check`

## Stop Conditions

- Stop if passing C005 requires weakening validator gates.
- Stop if the fixture work expands into provider-backed image generation or
  human visual review.
