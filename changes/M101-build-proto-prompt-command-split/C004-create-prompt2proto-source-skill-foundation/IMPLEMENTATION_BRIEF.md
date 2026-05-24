# C004 Implementation Brief

## Goal

Create the source `prompt2proto` skill foundation so `build-prototype` has a
real visual translation method before later command narrowing.

## Read First

- `changes/M101-build-proto-prompt-command-split/C002-design-prompt2proto-skill-contract-and-reference-architecture/PROMPT2PROTO_SKILL_DESIGN.md`
- `skills/prompt2proto/SKILL.md`
- `skills/prompt2proto/references/00_role_philosophy_engine.md`

## Do

- Keep `SKILL.md` lean and route detail through numbered references.
- Use Chief PM plus Principal UI/UX as the required role engine.
- Consume only ready prompt packs and refuse missing readiness/coherence gates.
- Treat density calibration as design judgment.
- Preserve no-go boundaries around provider generation, visual review, visual
  parity, proto2html, storyboard, and motion.

## Do Not

- Do not edit generated `.agents/**`.
- Do not edit `.openworkflow/**`.
- Do not edit command registry or runtime-surface checks in this candidate.
- Do not claim generated image quality or visual parity.

## Validation

- `rg -n "prompt2proto|Chief PM|Principal UI|visual hierarchy|density|coherence" skills/prompt2proto skills/build-prototype`
- `node dist/cli/src/index.js validate --root . --json`
- `node dist/cli/src/index.js summaries --root . --strict --json`
- `git diff --check`
