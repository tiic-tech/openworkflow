# C007 Implementation Brief

## Goal

Complete the M101 command split by narrowing `build-prototype` so it consumes
ready prompt-pack artifacts through prompt2proto, while `/ow:proto` remains the
compatibility-preserving user-facing orchestration command.

## Read First

- `changes/M101-build-proto-prompt-command-split/C007-narrow-build-prototype-to-prompt2proto/SELECTED_CHANGE.yaml`
- `changes/M101-build-proto-prompt-command-split/HIGH_RISK_DECISION_REPORT.md`
- `skills/build-prototype/SKILL.md`
- `skills/prompt2proto/SKILL.md`
- `skills/prompt2proto/references/01_input_contract.md`
- `skills/prompt2proto/references/02_prompt_pack_readiness.md`
- `skills/prompt2proto/references/03_visual_translation_workflow.md`
- `packages/core/src/commands/registry.ts`
- `packages/cli/src/dev/verifyRuntimeSurface.ts`
- `references/skill-system-lifecycle.md`

## Do

- Preserve M101 Option 1: `/ow:proto` remains user-facing.
- Move `build-prototype` source guidance away from vision-to-prompt-pack
  compilation and toward ready prompt-pack consumption through prompt2proto.
- Keep readiness gates explicit: prompt-pack integrity, prototype reality,
  screen manifest linkage, prototype system coherence, paragraph quality,
  post-validate, and the C006 philosophy engine.
- Regenerate `.agents/**` and `.openworkflow/audit/**` with `sync` after source
  registry/guidance edits.
- Complete with C007-local `LOCAL_COMMIT_EVIDENCE.yaml`.

## Do Not

- Do not remove `/ow:proto` as the user-facing compatibility path.
- Do not implement provider image generation, human visual review, visual
  parity scoring, proto2html, storyboard, or motion modeling.
- Do not change M100 prompt quality rubric or ready prompt paragraph anatomy.
- Do not hand-edit generated surfaces.

## Owned Paths

- `packages/core/src/commands/registry.ts`
- `skills/build-prototype/SKILL.md`
- `skills/prompt2proto/`
- `.agents/skills/ow-proto/SKILL.md`
- `.agents/skills/ow-prompt2proto/SKILL.md`
- `.openworkflow/audit/COMMAND_AUDIT_INDEX.yaml`
- `.openworkflow/audit/CONTEXT_PACKETS.yaml`
- `packages/cli/src/dev/verifyRuntimeSurface.ts`
- `changes/M101-build-proto-prompt-command-split/`

## Validation

```bash
npm run build
node dist/cli/src/index.js sync --root . --json
npm run verify:runtime-surface
node dist/cli/src/index.js validate --root . --json
node dist/cli/src/index.js summaries --root . --strict --json
git diff --check
```

## Stop Conditions

- Stop if compatibility requires removing or renaming `/ow:proto`.
- Stop if the work expands into provider generation, visual review, proto2html,
  storyboard, motion, specs, or production changes.
- Stop if generated surfaces would need manual edits rather than `sync`.
