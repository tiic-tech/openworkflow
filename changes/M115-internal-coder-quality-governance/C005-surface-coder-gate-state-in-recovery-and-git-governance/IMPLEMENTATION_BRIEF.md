# C005 Implementation Brief

## Goal

Expose coder gate state in recovery and local git evidence as guidance-only
metadata. This should help low-context Agents see whether coder governance is
pending, recorded, skipped, or missing without creating a hard gate.

## Read First

- `references/internal-coder-protocol.md`
- `skills/coder/SKILL.md`
- `packages/core/src/workflow/planningQueueResume.ts`
- `packages/core/src/workflow/summaryHealth.ts`
- `packages/core/src/git/localGitAutomation.ts`
- `packages/cli/src/dev/verifyRuntimeSurface.ts`

## Do

- Add additive `coder_gate` fields to recovery/read-model output.
- Add an optional `coder_gate` binding point to local commit evidence.
- Report missing coder gates as warnings or guidance only.
- Preserve read-only semantics for `resume`.

## Do Not

- Do not introduce mandatory `CODER_EVIDENCE.yaml`.
- Do not make missing coder evidence block handoff.
- Do not change remote git, PR, or GitHub behavior.
- Do not change existing command identities.

## Validation

- `npm run build`
- `npm run verify:runtime-surface`
- `node dist/cli/src/index.js resume --root . --json`
- `node dist/cli/src/index.js handoff --root . --json`
- `git diff --check`
