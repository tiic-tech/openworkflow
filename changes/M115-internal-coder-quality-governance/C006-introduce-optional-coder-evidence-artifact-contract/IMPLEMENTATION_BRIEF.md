# Implementation Brief: M115 C006

## Objective

Implement high-risk Option A from
`changes/M115-internal-coder-quality-governance/HIGH_RISK_DECISION_REPORT.md`:
define and validate optional embedded `coder_evidence` inside
`LOCAL_COMMIT_EVIDENCE.yaml`.

## Scope

In scope:

- Document optional `LOCAL_COMMIT_EVIDENCE.yaml.coder_evidence`.
- Validate malformed present `coder_evidence`.
- Keep missing `coder_evidence` valid.
- Add runtime-surface coverage.
- Record future standalone `CODE_EVIDENCE.yaml` as a separate candidate-change
  follow-up.

Out of scope:

- Mandatory coder evidence enforcement.
- Standalone `CODE_EVIDENCE.yaml` or `CODER_EVIDENCE.yaml` implementation.
- Discovery artifact registry exposure.
- Historical artifact migration.
- Remote git or PR behavior.

## Guardrails

- Do not add coder evidence to `.openworkflow/audit/ARTIFACT_CONTRACTS.yaml`.
- Do not edit generated `.agents/**` or `.openworkflow/**`.
- Do not fail validation for absent optional evidence.
- Do fail validation for malformed present evidence.
- Keep this as one selected-change implementation plus local commit evidence.

## Expected Validation

- `npm run build`
- `npm run verify:runtime-surface`
- `node dist/cli/src/index.js validate --root . --json`
- `node dist/cli/src/index.js resume --root . --json`
- `node dist/cli/src/index.js handoff --root . --json`
- `git diff --check`
