# M93 Proto Product-Archetype Reality Gate

Source of truth: `CANDIDATE_CHANGES.yaml`

Status: completed

Branch boundary: `codex/m73-workflow-blueprint-runtime-alignment`

## Scope

Upgrade the first-pass `/ow:proto` internal prompt compiler so VISION-only
discovery derives a product-category-aware experience model and blocks generic
prompt packs before image generation.

This queue is not about reference-image copying. It is about making OW infer the
target product category, product loop, primary canvas, domain objects,
interaction states, data realism, visual language, and anti-generic constraints
from VISION and validation artifacts.

## Selection Policy

Prefer changes that:

- make `/ow:vision2prompt` infer a product experience model before prompt directions;
- prevent artifact-valid but human-invalid prototype prompt packs;
- preserve the dailin pattern of strategic hypothesis plus product-system concreteness;
- force target-category reality checks before `/ow:prompt2proto`;
- keep product quality gates deterministic and inspectable.

Avoid:

- requiring external reference screenshots;
- provider-specific image generation changes;
- proto2html, html2spec, or production implementation work;
- replacing human prototype review with an overclaiming automated visual judge.

## Candidates

| ID | Status | Risk | Title | Dependencies |
| --- | --- | --- | --- | --- |
| C001 | done | medium | Define product experience model prompt-pack contract | none |
| C002 | done | medium | Wire product-archetype inference into `/ow:vision2prompt` | C001 |
| C003 | done | medium | Add prototype reality gate and deterministic validator fixtures | C001, C002 |
| C004 | done | medium | Add smart city product-reality regression fixture | C001, C002, C003 |

## Next Recommendation

M93 is complete. The first-pass prototype prompt path now has product
experience modeling, generated protocol guidance, deterministic
prototype_reality_gate validation, and smart city regression coverage for the
rejected generic AI governance dashboard outcome.

## Deferred

- `M94-reference-pattern-input-gate`
- `M95-provider-image-generation-benchmark`
- `M96-prototype-visual-quality-review-gate`
- `M97-smart-city-product-reality-dogfood`

## Candidate Details

### C001 - Define Product Experience Model Prompt-Pack Contract

Purpose: add durable first-pass prototype fields for product archetype, primary
canvas, IA, domain objects, task loop, state model, data realism, visual
language, and anti-generic constraints.

Owned paths:

- `packages/core/src/artifacts/registry.ts`
- `schemas/proto-prompt-pack.schema.json`
- `schemas/prototype-evidence.schema.json`
- `packages/core/src/validators/validateOpenWorkflow.ts`
- `packages/core/src/validators/validateRepositoryContracts.ts`
- `packages/core/src/workflow/summaryHealth.ts`
- `changes/M93-proto-product-archetype-reality-gate/`

Validation:

- `npm run build`
- `npm run validate`
- `node dist/cli/src/index.js validate --root . --json`
- `git diff --check`

### C002 - Wire Product-Archetype Inference Into `/ow:vision2prompt`

Purpose: update generated `/ow:proto` and `/ow:vision2prompt` protocols so they
infer product category and experience topology before creating strategic
directions.

Owned paths:

- `packages/core/src/commands/registry.ts`
- `skills/build-prototype/SKILL.md`
- `skills/build-prototype/references/strategic-prompt-pack-protocol.md`
- `packages/cli/src/dev/verifyWorkflowE2E.ts`
- `packages/cli/src/dev/verifyRuntimeSurface.ts`
- `.agents/skills/ow-proto/SKILL.md`
- `.agents/skills/ow-vision2prompt/SKILL.md`
- `.openworkflow/audit/CONTEXT_PACKETS.yaml`
- `changes/M93-proto-product-archetype-reality-gate/`

Validation:

- `npm run build`
- `npm run validate`
- `npm run verify:e2e-workflow`
- `npm run verify:runtime-surface`
- `node dist/cli/src/index.js sync --root . --json`
- `node dist/cli/src/index.js validate --root . --json`
- `git diff --check`

### C003 - Add Prototype Reality Gate And Deterministic Validator Fixtures

Purpose: add a pre-image-generation gate that fails prompt packs that are
category-mismatched, generic, or missing executable product loops.

Owned paths:

- `packages/core/src/artifacts/registry.ts`
- `schemas/proto-prompt-pack.schema.json`
- `schemas/prototype-evidence.schema.json`
- `packages/core/src/validators/validateOpenWorkflow.ts`
- `packages/core/src/validators/validateRepositoryContracts.ts`
- `packages/cli/src/dev/verifyRuntimeSurface.ts`
- `packages/cli/src/dev/verifyWorkflowE2E.ts`
- `changes/M93-proto-product-archetype-reality-gate/`

Validation:

- `npm run build`
- `npm run validate`
- `npm run verify:runtime-surface`
- `npm run verify:e2e-workflow`
- `node dist/cli/src/index.js validate --root . --json`
- `git diff --check`

### C004 - Add Smart City Product-Reality Regression Fixture

Purpose: encode the smart city failure so future prompt compiler changes must
produce map-first smart city operations dashboard constraints instead of a
generic AI governance report dashboard.

Owned paths:

- `packages/cli/src/dev/verifyRuntimeSurface.ts`
- `packages/cli/src/dev/verifyWorkflowE2E.ts`
- `changes/M93-proto-product-archetype-reality-gate/`

Validation:

- `npm run build`
- `npm run validate`
- `npm run verify:runtime-surface`
- `npm run verify:e2e-workflow`
- `git diff --check`
