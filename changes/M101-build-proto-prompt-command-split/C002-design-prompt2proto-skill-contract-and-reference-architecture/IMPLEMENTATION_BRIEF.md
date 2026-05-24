# C002 Implementation Brief

## Goal

Design prompt2proto before source creation: define the role engine, input
readiness contract, UI/UX translation method, output evidence shape, and
quality rubric needed by `build-prototype`.

## Do

- Use the user-provided `skill_generator` as the design method for role engine,
  reference structure, and internal validation.
- Keep prompt2proto as a consumer of ready prompt packs.
- Separate coherence as build-proto-prompt prompt-pack contract from density as
  Chief PM plus Principal UI/UX design judgment.
- Exclude provider-backed generation and visual parity claims.

## Validation

- `rg -n "prompt2proto|Principal UI|Chief PM|density|coherence" skills changes/M101-build-proto-prompt-command-split`
- `node dist/cli/src/index.js validate --root . --json`
- `node dist/cli/src/index.js summaries --root . --strict --json`
- `git diff --check`
