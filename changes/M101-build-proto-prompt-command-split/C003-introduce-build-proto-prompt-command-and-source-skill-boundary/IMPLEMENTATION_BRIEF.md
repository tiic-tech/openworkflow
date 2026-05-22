# C003 Implementation Brief

## Goal

Introduce `build-proto-prompt` as the internal prompt-pack compiler command and
source skill boundary while preserving the existing `/ow:vision2prompt`
compatibility surface.

## Do

- Add `/ow:build-proto-prompt` as an internal command.
- Add `skills/build-proto-prompt/` as the source prompt-pack compiler skill.
- Keep the role engine as Co-Founder plus Chief PM / senior product strategist.
- Run `sync` so generated `.agents/**` and `.openworkflow/audit/**` surfaces
  are regenerated from source.
- Add runtime-surface assertions for the generated command and skill.

## Do Not

- Do not remove `/ow:vision2prompt` in this candidate.
- Do not narrow `build-prototype` consumption yet.
- Do not implement provider-backed image generation.
- Do not run human visual review, visual parity scoring, proto2html,
  storyboard, or motion work.

## Validation

- `npm run build`
- `node dist/cli/src/index.js sync --root . --json`
- `npm run verify:runtime-surface`
- `node dist/cli/src/index.js validate --root . --json`
- `node dist/cli/src/index.js summaries --root . --strict --json`
- `git diff --check`
