# C006 Implementation Brief

## Goal

Inject the Chief PM plus Principal UI/UX philosophy engine into
`build-prototype` so density calibration and information hierarchy are treated
as product/design judgment before visual translation.

## Read First

- `changes/M101-build-proto-prompt-command-split/C006-build-prototype-philosophy-engine/SELECTED_CHANGE.yaml`
- `changes/M101-build-proto-prompt-command-split/HIGH_RISK_DECISION_REPORT.md`
- `skills/prompt2proto/SKILL.md`
- `skills/prompt2proto/references/00_role_philosophy_engine.md`
- `skills/prompt2proto/references/03_visual_translation_workflow.md`
- `skills/build-prototype/SKILL.md`
- `skills/build-prototype/references/strategic-prompt-pack-protocol.md`
- `packages/core/src/commands/registry.ts`
- `packages/cli/src/dev/verifyRuntimeSurface.ts`

## Do

- Preserve M101 option 1: `/ow:proto` remains the user-facing orchestration
  surface while internal stages separate prompt-pack compilation from
  prompt2proto consumption.
- Make `build-prototype` start from Chief PM plus Principal UI/UX judgment.
- Add practical density calibration guidance by industry, user role, risk,
  screen size, task frequency, and information hierarchy.
- Keep technical multi-screen consistency tied to the existing
  `prototype_system_contract`; C006 owns density and visual judgment.
- Run `sync` after registry/source guidance changes instead of hand-editing
  generated surfaces.
- Complete with C006-local `LOCAL_COMMIT_EVIDENCE.yaml`.

## Do Not

- Do not reopen C005 or change the prototype system coherence contract except
  where build-prototype consumes it.
- Do not change M100 prompt paragraph anatomy.
- Do not implement provider-backed image generation, visual review, visual
  parity scoring, proto2html, storyboard, or motion modeling.
- Do not narrow build-prototype to ready prompt-pack consumption; C007 owns the
  final narrowing after C006 completes.

## Owned Paths

- `skills/prompt2proto/`
- `skills/build-prototype/SKILL.md`
- `skills/build-prototype/references/`
- `packages/core/src/commands/registry.ts`
- `packages/cli/src/dev/verifyRuntimeSurface.ts`
- `.agents/skills/ow-prompt2proto/SKILL.md`
- `.openworkflow/audit/COMMAND_AUDIT_INDEX.yaml`
- `.openworkflow/audit/CONTEXT_PACKETS.yaml`
- `changes/M101-build-proto-prompt-command-split/`

## Validation

```bash
npm run build
npm run verify:runtime-surface
node dist/cli/src/index.js sync --root . --json
node dist/cli/src/index.js validate --root . --json
node dist/cli/src/index.js summaries --root . --strict --json
git diff --check
```

## Stop Conditions

- Stop if the work requires provider image generation, visual review,
  proto2html, storyboard, or motion modeling.
- Stop if implementation would make build-prototype consume ready prompt packs
  before C007.
- Stop if generated surfaces would need manual edits rather than `sync`.
