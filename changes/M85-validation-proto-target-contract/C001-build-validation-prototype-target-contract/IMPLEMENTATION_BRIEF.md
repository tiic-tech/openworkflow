# C001 Build Validation Prototype Target Contract

## Goal

Reposition native `skills/build-validation` as the source behavior for
`/ow:validation`: a prototype validation target compiler that consumes
proto-ready vision and produces one experiment target for `/ow:proto`.

## Non-Goals

- Do not change generated `.agents/skills/ow-validation`.
- Do not change validation artifact schemas.
- Do not implement `/ow:proto`.
- Do not create `.openworkflow/validation/**` artifacts.

## Verification

- `npm run validate`
- `node dist/cli/src/index.js validate --root . --json`
- `git diff --check`
