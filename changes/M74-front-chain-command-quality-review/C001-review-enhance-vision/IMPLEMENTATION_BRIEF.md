# C001 Review and Enhance /ow:vision

## Goal

Make `/ow:vision` stronger for the Agent as OW artifacts' first consumer. The
command should help an Agent orient, ask the right next question, understand
safe write boundaries, trust source-of-truth artifacts, and hand off to
`/ow:validation` without whole-repo scanning.

## Read First

- `changes/M74-front-chain-command-quality-review/C001-review-enhance-vision/SELECTED_CHANGE.yaml`
- `packages/core/src/commands/registry.ts`
- `packages/core/src/artifacts/registry.ts`
- `.agents/skills/ow-vision/SKILL.md`
- `.openworkflow/audit/CONTEXT_PACKETS.yaml`
- `packages/cli/src/dev/verifyWorkflowE2E.ts`
- `packages/cli/src/dev/verifyRuntimeSurface.ts`

## Do

- Audit the current `/ow:vision` consumer path from the perspective of a
  low-context implementing Agent.
- Fix source-of-truth protocol, artifact contract, summary/current-slice, or
  verification gaps that make `/ow:vision` less trustworthy or less useful.
- Preserve the conversation-first nature of `/ow:vision`.
- Run `openworkflow sync` after source changes so generated skill and audit
  surfaces refresh from source.
- Add or update verification that captures normal use and failure clarity.

## Do Not

- Do not implement `/ow:validation`, `/ow:proto`, `/ow:tune`, `proto2html`, or
  downstream workflow commands.
- Do not hand-edit generated `.agents/**` or `.openworkflow/**` surfaces as the
  source fix.
- Do not let `/ow:vision` create validation, prototype, spec, change, or runtime
  artifacts.
- Do not turn the command into a generic questionnaire or batch interview.

## Owned Paths

- `packages/core/src/commands/registry.ts`
- `packages/core/src/artifacts/registry.ts`
- `packages/core/src/workflow/summaryHealth.ts`
- `packages/core/src/validators/validateOpenWorkflow.ts`
- `schemas/vision-session.schema.json`
- `packages/cli/src/dev/verifyWorkflowE2E.ts`
- `packages/cli/src/dev/verifyRuntimeSurface.ts`
- generated `ow-vision` and audit files only through `openworkflow sync`

## Validation

- `npm run validate`
- `npm run build`
- `node dist/cli/src/index.js sync --root . --json`
- `node dist/cli/src/index.js validate --root . --json`
- `git diff --check`

## Stop Conditions

- Stop and report if the required fix would expose a new runtime command or
  mutate adapter generation broadly.
- Stop and report if `/ow:vision` improvements require changing validation,
  proto, or tune behavior in the same commit.
- Stop and report if validation shows existing generated surfaces drift from
  source in a way that cannot be resolved by `sync`.
