# C001 Build Vision Delayed Compile Contract

## Goal

Define `/ow:vision` delayed-compile behavior and add the missing native
`skills/build-vision/` source skill.

## Read First

- `docs/DISCOVER_LOOP_UPGRATE_PLAN.md`
- `skills/build-vision/SKILL.md`
- `skills/build-vision/references/vision-interview-protocol.md`
- `skills/build-vision/references/proto-readiness-rubric.md`
- `changes/M84-vision-delayed-compile-proto-readiness/C001-build-vision-delayed-compile-contract/SELECTED_CHANGE.yaml`

## Do

- Preserve the distinction between interview, checkpoint, and compile modes.
- Make interview mode explicitly no durable per-answer write.
- Treat proto-readiness as the compile gate.
- Keep `build-vision` as native source behavior, not generated adapter output.
- Update repository validation so the source skill remains present.

## Do Not

- Do not modify validation, proto, or tune behavior in this change.
- Do not change generated `.agents/**` or `.openworkflow/**` files.
- Do not implement schema or runtime command changes here.

## Owned Paths

- `docs/DISCOVER_LOOP_UPGRATE_PLAN.md`
- `skills/build-vision/`
- `packages/core/src/validators/validateRepositoryContracts.ts`
- `changes/M84-vision-delayed-compile-proto-readiness/`

## Validation

- `npm run validate`
- `node dist/cli/src/index.js validate --root . --json`
- `git diff --check`

## Stop Conditions

- Stop if implementing build-vision requires changing generated adapter behavior.
- Stop if delayed compile requires a broader workflow transaction design.
