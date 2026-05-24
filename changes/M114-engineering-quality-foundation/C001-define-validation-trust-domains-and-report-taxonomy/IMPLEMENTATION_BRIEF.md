# M114 C001 Implementation Brief

## Goal

Define the validation trust-domain taxonomy that explains which OW commands
prove entry trust, which prove broad repository/release readiness, and how a
fresh Agent should interpret narrower green signals when broader validation is
red.

## Read First

- `docs/OW_ENGINEERING_QUALITY_CC_BASIS.md`
- `changes/M114-engineering-quality-foundation/CANDIDATE_CHANGES.yaml`
- `/Users/archy/.codex/skills/ow-code-quality-governor/SKILL.md`
- `/Users/archy/.codex/skills/ow-code-quality-governor/references/01_openworkflow_quality_model.md`
- `/Users/archy/.codex/skills/ow-code-quality-governor/references/03_validation_ladder.md`

## Do

- Create `references/validation-trust-domains.md`.
- Map `handoff`, `inspect`, `summaries`, `doctor`, `context --handoff`,
  `validate`, runtime verifiers, fixture checks, and release checks to explicit
  trust domains.
- Record current `npm run validate` failure classes as baseline red quality
  debt, not as acceptable health.
- Keep this slice taxonomy-only.

## Do Not

- Do not change validator behavior or public CLI JSON shape.
- Do not fix historical planning artifacts.
- Do not edit generated `.agents/**` or `.openworkflow/**`.
- Do not refactor source files in this slice.

## Owned Paths

- `docs/OW_ENGINEERING_QUALITY_CC_BASIS.md`
- `references/validation-trust-domains.md`
- `changes/M114-engineering-quality-foundation/`

## Validation

- `npm run build`
- `node dist/cli/src/index.js handoff --root . --json`
- `node dist/cli/src/index.js inspect --root . --strict --json`
- `node dist/cli/src/index.js summaries --root . --strict --json`
- `npm run validate`
- `git diff --check`

## Stop Conditions

- The change requires modifying validators or command output.
- The change starts hiding or fixing historical validation failures.
- The change touches generated surfaces.
