# C001 Implementation Brief

## Goal

Record the M101 high-risk decision gate before any command split implementation:
preserve `/ow:proto` as the user-facing workflow, introduce
`build-proto-prompt` as the prompt-pack compiler stage, and narrow
`build-prototype` only after prompt2proto has a real skill contract and source
foundation.

## Read First

- `changes/M101-build-proto-prompt-command-split/HIGH_RISK_DECISION_REPORT.md`
- `changes/M101-build-proto-prompt-command-split/CANDIDATE_CHANGES.yaml`
- `changes/M100-dailin-grade-image-prompt-paragraphs/SUMMARY.yaml`
- `changes/M100-dailin-grade-image-prompt-paragraphs/C006-record-no-go-criteria-for-future-visual-parity-work/HANDOFF_REPORT.md`

## Do

- Keep C001 design-only.
- Confirm option 1 as the approved migration direction for this queue.
- Record that prompt2proto design is a prerequisite, not a later cleanup item.
- Preserve `/ow:proto` compatibility until a selected implementation candidate proves a different migration is safer.
- Keep multi-screen drift in the build-proto-prompt coherence contract and density calibration in build-prototype's Chief PM plus Principal UI/UX philosophy engine.

## Do Not

- Do not edit source skills.
- Do not edit command registry or validators.
- Do not run generated adapter sync for this candidate.
- Do not patch `.agents/**` or `.openworkflow/**`.
- Do not enter provider-backed image generation, human visual review, visual parity scoring, proto2html, storyboard, or motion work.

## Owned Paths

- `changes/M101-build-proto-prompt-command-split/HIGH_RISK_DECISION_REPORT.md`
- `changes/M101-build-proto-prompt-command-split/C001-decide-command-split-prompt2proto-skill-architecture-and-migration-guardrails/`
- `changes/M101-build-proto-prompt-command-split/CANDIDATE_CHANGES.yaml`
- `changes/M101-build-proto-prompt-command-split/CANDIDATE_CHANGES.md`

## Validation

- `node dist/cli/src/index.js validate --root . --json`
- `node dist/cli/src/index.js summaries --root . --strict --json`
- `git diff --check`

## Stop Conditions

- The work requires source skill, registry, validator, generated adapter, or managed audit surface edits.
- The split would narrow build-prototype before prompt2proto has a designed skill contract.
- The work expands into provider image generation, human visual review, visual parity scoring, proto2html, storyboard, or motion modeling.
