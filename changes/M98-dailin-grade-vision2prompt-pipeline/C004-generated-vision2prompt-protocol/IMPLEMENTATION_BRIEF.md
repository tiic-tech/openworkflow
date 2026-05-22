# C004 Implementation Brief

## Goal

Wire the dailin-grade vision2prompt pipeline into generated `/ow:vision2prompt`
protocol guidance and block `/ow:prompt2proto` handoff until prompt-pack
integrity, screen-bound executability, reality, and post-validation gates pass.

## Read First

- `changes/M98-dailin-grade-vision2prompt-pipeline/CANDIDATE_CHANGES.yaml`
- `packages/core/src/commands/registry.ts`
- `packages/adapters/codex/src/generateSkills.ts`
- `packages/adapters/codex/src/templates.ts`
- `skills/build-prototype/SKILL.md`
- `skills/build-prototype/references/strategic-prompt-pack-protocol.md`
- `skills/build-prototype/references/vision2prompt/`

## Do

- Update registry protocol source so generated `/ow:vision2prompt` names the
  strategic prompt-pack protocol and runs `references/vision2prompt/01` through
  `07` before writing `PROTO_PROMPT_PACK`.
- Require compact intermediate outputs for normalized input, vision
  decomposition, candidate hypotheses, product experience model,
  `screen_manifest`, prompt schema, output manifest, and quality rubric.
- Block `prompt_text_manifest.status: ready_for_image_generation` when
  `prompt_pack_integrity_gate`, `prototype_reality_gate`,
  `quality_rubric.prompt_executability`, screen linkage, or `post_validate`
  fails.
- Make generated `/ow:prompt2proto` refuse prompt packs whose integrity,
  reality, executability, or screen linkage gates fail.
- Regenerate `.agents` and managed context packet output through
  `node dist/cli/src/index.js sync --root . --tools codex --json`.
- Align the local agent e2e validation fixture with current `/ow:proto`
  readiness fields so C004 validation can run end to end.
- Record local evidence and update queue status when complete.

## Do Not

- Do not hand-edit generated `.agents/**` as the durable fix.
- Do not change unrelated `/ow` commands beyond the existing
  `/ow:proto -> /ow:vision2prompt -> /ow:prompt2proto` chain.
- Do not add provider-backed image generation, visual parity scoring,
  proto2html, storyboard, or motion modeling.

## Owned Paths

- `packages/core/src/commands/registry.ts`
- `packages/adapters/codex/src/generateSkills.ts`
- `packages/adapters/codex/src/templates.ts`
- `packages/cli/src/dev/verifyAgentE2E.ts`
- `skills/build-prototype/SKILL.md`
- `skills/build-prototype/references/`
- `.agents/skills/ow-vision2prompt/SKILL.md`
- `.agents/skills/ow-prompt2proto/SKILL.md`
- `.agents/skills/ow-proto/SKILL.md`
- `.openworkflow/audit/CONTEXT_PACKETS.yaml`
- `changes/M98-dailin-grade-vision2prompt-pipeline/`

## Validation

- `npm run build`
- `node dist/cli/src/index.js sync --root . --tools codex --json`
- `npm run validate`
- `npm run verify:agent-e2e`
- `rg -n "prompt_pack_integrity_gate|screen_manifest|vision2prompt reference pipeline" .agents/skills/ow-vision2prompt/SKILL.md skills/build-prototype`
- `node dist/cli/src/index.js validate --root . --json`
- `node dist/cli/src/index.js summaries --root . --strict --json`
- `git diff --check`

## Stop Conditions

- Stop if generated adapter files cannot be produced by source registry or
  template changes plus sync.
- Stop if the change requires provider-backed image calls, visual review,
  remote operations, or release publishing.
- Stop if prompt2proto refusal requires image-generation implementation changes
  instead of generated protocol guidance.
