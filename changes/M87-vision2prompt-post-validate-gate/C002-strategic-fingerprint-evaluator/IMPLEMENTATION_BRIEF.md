# C002 Implementation Brief

Implement the deterministic strategic fingerprint evaluator for
`post_validate`.

## Goal

When a strategic prompt pack has multiple directions and prompt text is ready,
the validator should compare direction-level strategic fingerprints and reject
over-similar direction sets. This must be deterministic and local: no embedding
or LLM calls.

## Read First

- `packages/core/src/validators/validateOpenWorkflow.ts`
- `packages/core/src/validators/validateRepositoryContracts.ts`
- `packages/cli/src/dev/verifyRuntimeSurface.ts`

## Do

- Read each direction's `strategic_fingerprint` mapping when present.
- Normalize values into stable comparable tokens.
- Compute pairwise similarity across the configured `fingerprint_dimensions`.
- Use `post_validate.threshold_policy.max_pairwise_similarity` as the fail
  threshold.
- Keep `resolved_count: 1` as a skipped gate.
- Produce errors that name the direction pair and shared dimensions.
- Add runtime verification fixtures for duplicate/near-duplicate, distinct, and
  one-direction skipped cases.

## Do Not

- Do not call external embedding or LLM providers.
- Do not generate prototype images.
- Do not change `/ow:tune`.
- Do not update generated skill protocol in this candidate.

## Validation

- `npm run build`
- `npm run validate`
- `npm run verify:runtime-surface`
- `node dist/cli/src/index.js validate --root . --json`
- `git diff --check`
