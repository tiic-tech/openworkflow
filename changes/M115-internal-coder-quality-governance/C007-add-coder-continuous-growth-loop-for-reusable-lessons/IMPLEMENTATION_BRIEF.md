# C007 Implementation Brief

## Goal

Define how repeated coder-governance lessons become durable OW source policy
without creating unmanaged project memory or autonomous memory writes.

## Read First

- `skills/coder/SKILL.md`
- `references/internal-coder-protocol.md`
- `references/coder-continuous-growth-loop.md`

## Do

- Keep the growth loop source-owned and reviewable.
- Require evidence before promoting a lesson into durable policy.
- Separate coder policy from future project-local `SOUL.md` and `MEMORY.md`.
- Bind validation evidence to selected-change or local commit evidence.

## Do Not

- Do not implement project-local memory.
- Do not add autonomous memory writes.
- Do not add hard enforcement gates.
- Do not edit generated `.agents/**` or `.openworkflow/**` surfaces.

## Owned Paths

- `skills/`
- `references/`
- `changes/M115-internal-coder-quality-governance/`

## Validation

- `node dist/cli/src/index.js inspect --root . --strict --json`
- `node dist/cli/src/index.js summaries --root . --strict --json`
- YAML parse for queue and C007 planning artifacts
- `git diff --check`
