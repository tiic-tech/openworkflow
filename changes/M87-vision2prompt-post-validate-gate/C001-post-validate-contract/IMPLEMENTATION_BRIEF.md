# C001 Implementation Brief

Define the prompt asset post-validate artifact contract for `/ow:vision2prompt`.

## Goal

Prompt-pack artifacts must be able to record a deterministic post-validation
result after prompt assets are generated and before `/ow:prompt2proto` starts.
The contract must support `pass`, `fail`, and `skipped`, with `skipped` required
when the user explicitly requested exactly one strategic direction.

## Read First

- `packages/core/src/artifacts/registry.ts`
- `schemas/proto-prompt-pack.schema.json`
- `schemas/prototype-evidence.schema.json`
- `packages/core/src/validators/validateOpenWorkflow.ts`
- `packages/core/src/validators/validateRepositoryContracts.ts`

## Do

- Add `post_validate` to strategic prompt-pack templates and schemas.
- Include strategic fingerprint dimensions:
  product form, trigger, interaction model, emotional driver, retention
  mechanism, metric, main risk, trust model, and privacy model.
- Add threshold policy fields and comparison/audit containers.
- Enforce skip behavior for `direction_count_policy.resolved_count: 1`.
- Enforce pass/fail requirement before image generation when direction count is
  `2` or more and prompt text is ready.

## Do Not

- Do not implement the full fingerprint comparison algorithm.
- Do not update generated `/ow:vision2prompt` or `/ow:proto` skills in this
  candidate.
- Do not generate images.
- Do not change `/ow:tune`.

## Validation

- `npm run build`
- `npm run validate`
- `node dist/cli/src/index.js validate --root . --json`
- `git diff --check`
