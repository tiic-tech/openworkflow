# M15 Acceptance

M15 is accepted when `/ow:vision` and `/ow:design` behave as interactive
clarification modes first and artifact-authoring modes second.

## Required Checks

- `npm run build`
- `npm run validate`
- `npm run verify:runtime-surface`
- `npm run smoke:init`
- `node dist/cli/src/index.js sync --root /tmp/openworkflow-m04-smoke --tools codex`
- `node dist/cli/src/index.js doctor --root /tmp/openworkflow-m04-smoke --tools codex`
- `npm run validate:cli`

## Product Checks

- Vision asks one focused question at a time and uses each answer to drive the next question.
- Vision does not hand off to validation until mandatory discovery dimensions are covered and the user confirms readiness.
- Design does not turn thin prototype or decision evidence into design artifacts before clarifying UX behavior and scope.
- Artifact writes happen at meaningful checkpoints after stable answers, not as the opening move.
- Built-in skills use OpenSpec-style XML sections to isolate user-visible response rules from inner thinking, private protocol, and artifact bookkeeping.
- Inner thinking, private reasoning, checklists, routine reads, and routine writes are explicitly non-user-facing.
- Generated Codex skills make the interactive behavior explicit without expanding this change into `/ow:tune` or `/ow:proto`.
