# C001 Implementation Brief

## Goal

Define the internal `/ow:coder` protocol contract without changing runtime
behavior. The contract should make coder governance a cross-cutting Agent-only
quality primitive for source edits, not a user-facing "write code" command.

## Read First

- `references/planning-artifact-contracts.md`
- `references/runtime-command-surface.md`
- `references/skill-system-lifecycle.md`
- `references/validation-trust-domains.md`
- `/Users/archy/.codex/skills/ow-code-quality-governor/SKILL.md`
- `changes/M115-internal-coder-quality-governance/CANDIDATE_CHANGES.yaml`

## Do

- Add a reference contract under `references/`.
- State that `/ow:coder` is internal, Agent-only, and not a normal user-facing
  coding entrypoint.
- Define preflight owner/file/dependency map expectations.
- Define RED evidence, GREEN evidence, post-write self-check, validation
  ladder, and evidence binding responsibilities.
- Explain why `/ow:coder` must not replace `/ow:change` or `/ow:team`.
- Name future integration points for change, team, git-automation, resume,
  context, handoff, summaries, and inspect without implementing them.

## Do Not

- Do not edit command registry, schemas, validators, generated `.agents/**`, or
  `.openworkflow/**` surfaces.
- Do not migrate the system skill into repo source; C002 owns that.
- Do not create `CODER_EVIDENCE.yaml`; C006 owns evidence shape.
- Do not change CLI JSON output or runtime enforcement.

## Owned Paths

- `references/`
- `changes/M115-internal-coder-quality-governance/`

## Validation

- `node dist/cli/src/index.js handoff --root . --json`
- `node dist/cli/src/index.js inspect --root . --strict --json`
- `node dist/cli/src/index.js resume --root . --json`
- `git diff --check`

## Stop Conditions

- Stop if the contract requires registry or generated-surface edits.
- Stop if the contract requires a new evidence schema.
- Stop if public command listings, CLI JSON shape, or runtime enforcement must
  change to satisfy the acceptance criteria.
