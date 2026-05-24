# M106 C001 Implementation Brief

## Goal

Define the read-only `resume --json` packet contract and command boundary for
the Agent resume cockpit. This selected change should make the expected packet
shape and CLI surface clear before later candidates implement aggregation.

## Read First

- `changes/M106-agent-resume-cockpit/CANDIDATE_CHANGES.yaml`
- `changes/M106-agent-resume-cockpit/C001-define-resume-packet-contract-and-command-boundary/SELECTED_CHANGE.yaml`
- `references/planning-artifact-contracts.md`
- `packages/core/src/commands/registry.ts`
- relevant CLI command registration/help files under `packages/cli/src/`

## Do

- Define the required `resume --json` top-level packet fields.
- Capture trust signals, active queue fields, current work item fields, action
  guidance, and evidence classification at the contract level.
- Make the read-only boundary explicit in source-owned command/help surfaces.
- Keep the implementation small enough to complete as one local commit.

## Do Not

- Do not implement the full resume aggregator.
- Do not change `handoff`, `inspect`, `summaries`, or `check` semantics.
- Do not hand-edit generated `.agents/**` or managed `.openworkflow/**` files.
- Do not add artifact lineage, prompt2proto strategy, provider metadata, or a
  write preflight compiler to the resume packet.

## Owned Paths

- `packages/cli/src/`
- `packages/core/src/commands/registry.ts`
- `packages/core/src/onboarding/`
- `references/planning-artifact-contracts.md`
- `changes/M106-agent-resume-cockpit/`

## Validation

- `npm run build`
- `npm run verify:runtime-surface`
- `node dist/cli/src/index.js validate --root . --json`
- `node dist/cli/src/index.js summaries --root . --strict --json`
- `node dist/cli/src/index.js handoff --root . --json`
- `git diff --check`

## Stop Conditions

- The work starts requiring broad aggregation logic instead of contract and
  boundary definition.
- The command surface would imply mutation or state repair.
- Generated `.agents/**` or `.openworkflow/**` edits appear necessary before a
  source-owned generator change is identified.
