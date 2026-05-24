# C002 Implementation Brief

## Goal

Move durable OW-specific coder governance guidance into a repo-owned source
skill. The result should be a narrow `skills/coder/SKILL.md` that future
registry/generated-surface work can consume.

## Read First

- `references/internal-coder-protocol.md`
- `references/validation-trust-domains.md`
- `references/skill-system-lifecycle.md`
- `references/git-version-control-governance.md`
- `/Users/archy/.codex/skills/ow-code-quality-governor/SKILL.md`
- `/Users/archy/.codex/skills/ow-code-quality-governor/references/01_openworkflow_quality_model.md`
- `/Users/archy/.codex/skills/ow-code-quality-governor/references/02_refactor_execution_protocol.md`
- `/Users/archy/.codex/skills/ow-code-quality-governor/references/03_validation_ladder.md`
- `/Users/archy/.codex/skills/ow-code-quality-governor/references/04_continuous_growth_loop.md`

## Do

- Add `skills/coder/SKILL.md`.
- Keep the skill internal-protocol oriented and OW-specific.
- Preserve the useful quality model, preflight, RED/GREEN, self-check,
  validation ladder, evidence binding, and growth-loop guidance.
- Point to repo-owned references first; use system-skill material only as the
  migration source.
- Run repo-local `sync --tools codex --json` and review effects.

## Do Not

- Do not hand-edit generated `.agents/skills/**`.
- Do not register `/ow:coder` in `packages/core/src/commands/registry.ts`; C003
  owns that.
- Do not change `/ow:change`, `/ow:team`, git automation behavior, schemas,
  validators, or CLI JSON output.

## Owned Paths

- `skills/`
- `references/`
- `packages/core/src/onboarding/`
- `changes/M115-internal-coder-quality-governance/`

## Validation

- `npm run build`
- `node dist/cli/src/index.js sync --root . --tools codex --json`
- `node dist/cli/src/index.js inspect --root . --strict --json`
- `git diff --check`

## Stop Conditions

- Stop if source skill migration requires command registry changes.
- Stop if sync wants unrelated generated-surface changes.
- Stop if the migration widens into user-facing quality review or mandatory
  evidence enforcement.
