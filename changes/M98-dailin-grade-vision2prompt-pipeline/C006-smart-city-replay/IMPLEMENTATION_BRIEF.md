# C006 Implementation Brief

Change: Replay smart city prompt pack with dailin-grade contract.

## Goal

Prove that the formal smart city `PROTO_PROMPT_PACK.yaml` can carry the
complete product prototype brief before image generation. The replay should
close the M97 source-completeness gap without claiming provider image quality,
visual reference parity, proto2html readiness, or motion/storyboard coverage.

## Owned Paths

- `examples/`
- `packages/cli/src/dev/verifyRuntimeSurface.ts`
- `docs/M97_PRODUCT_REALITY_E2E_SYNTHESIS_REPORT.md`
- `changes/M98-dailin-grade-vision2prompt-pipeline/`

## Implementation

Add a stored smart city replay prompt pack under
`examples/m98-smart-city-replay/` using the final M98 strategic prompt-pack
contract. The prompt pack must include:

- `prototype_brief`
- `screen_manifest`
- `global_design_system_prompt`
- `directions[].screen_prompts`
- screen negative prompts and acceptance criteria
- `quality_rubric`
- `prototype_reality_gate`
- `prompt_pack_integrity_gate`
- `image_generation.status: not_started`

Runtime verification should read that stored YAML, assert that planning,
incident, and asset capacity are screen-bound states/modules inside one shared
map-first product shell, and validate the prompt pack through the repo dist CLI
inside a temporary OpenWorkflow prototype directory.

## Non-Goals

- Do not run provider-backed image generation.
- Do not perform human visual review or visual reference parity scoring.
- Do not create proto2html artifacts.
- Do not model storyboard or motion.
- Do not mutate the `smart_city_copilot` target repository active artifacts.

## Verification

- `npm run build`
- `npm run verify:runtime-surface`
- `npm run validate`
- `node dist/cli/src/index.js validate --root . --json`
- `node dist/cli/src/index.js summaries --root . --strict --json`
- `git diff --check`
