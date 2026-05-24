# C005 Implementation Brief

## Goal

Add `prototype_system_contract` to ready prototype prompt packs so
multi-screen drift is handled as a prompt-pack consistency contract before
prompt2proto translates the pack into visual prototype instructions.

## Do

- Add schema and artifact-contract support for `prototype_system_contract`.
- Require the contract for ready strategic prompt packs.
- Include stable app shell, navigation taxonomy, data vocabulary, domain object
  anatomy, object detail anatomy, action bar, audit/trust pattern, copy tone,
  and allowed screen deltas.
- Update build-proto-prompt guidance to write the contract before screen
  prompts.
- Update prompt2proto and build-prototype guidance to consume the contract.
- Regenerate managed Codex and OpenWorkflow surfaces from source.

## Do Not

- Do not treat density calibration as part of this contract.
- Do not implement provider-backed image generation.
- Do not run human visual review or visual parity scoring.
- Do not enter proto2html, storyboard, or motion modeling.

## Validation

- `npm run build`
- `node dist/cli/src/index.js sync --root . --json`
- `npm run verify:runtime-surface`
- `node dist/cli/src/index.js validate --root . --json`
- `node dist/cli/src/index.js summaries --root . --strict --json`
- `git diff --check`
