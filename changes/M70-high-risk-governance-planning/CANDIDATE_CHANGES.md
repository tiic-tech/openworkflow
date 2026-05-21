# Candidate Changes: High-Risk Governance And Skill Hardening

Source of truth: `CANDIDATE_CHANGES.yaml`

This Markdown file is the human-readable view. If it conflicts with the YAML,
the YAML wins.

## Selection Policy

Prefer artifact contracts before source skill behavior, source skill updates
before generated runtime surfaces, stop-gate behavior before broad adapter
architecture, and validation or dogfood evidence before relying on the new
workflow behavior.

Avoid implementing high-risk adapter delivery before explicit user decision,
changing generated `.agents` surfaces directly, treating high-risk reports as
chat-only guidance, letting `select-change` silently select `risk: high`
candidates, or committing experimental non-Codex generated surfaces.

Next recommended candidate: `G004`.

Feat boundary: this queue owns
`changes/M70-high-risk-governance-planning/`. Each `G###` candidate is expected
to land as one focused commit with selection artifacts under this feat folder.

## G001 - Formalize High-Risk Decision Report Contract

Status: `done`

Purpose: define `HIGH_RISK_DECISION_REPORT.md` as a first-class planning
artifact so high-risk stops have a stable structure, output path, required
sections, and queue audit expectations.

Owned paths:

- `references/planning-artifact-contracts.md`
- `changes/M70-high-risk-governance-planning/G001-high-risk-report-contract/`

Validation:

- `npm run validate`
- `git diff --check`

Selection: `G001-high-risk-report-contract`

Completion evidence:

- `references/planning-artifact-contracts.md`
- `npm run validate`
- `git diff --check`

## G002 - Add High-Risk Report Behavior To Decompose-To-Changes

Status: `done`

Depends on: `G001`

Purpose: teach `decompose-to-changes` to plan high-risk governance explicitly,
including creating or updating a high-risk decision report when a queue reaches
`risk: high` candidates that require user confirmation.

Selection: `G002-dtc-high-risk-report-behavior`

Completion evidence:

- `skills/decompose-to-changes/SKILL.md`
- `skills/decompose-to-changes/references/decomposition-protocol.md`
- `quick_validate.py skills/decompose-to-changes`
- `npm run validate`
- `git diff --check`

## G003 - Add High-Risk Stop Gate To Select-Change

Status: `done`

Depends on: `G001`

Purpose: teach `select-change` to stop before selecting or implementing
`risk: high` candidates unless the user explicitly approves a concrete decision
option.

Selection: `G003-select-high-risk-stop-gate`

Completion evidence:

- `skills/select-change/SKILL.md`
- `skills/select-change/references/selection-protocol.md`
- `quick_validate.py skills/select-change`
- `npm run validate`
- `git diff --check`

## G004 - Add High-Risk Report Validation And Dogfood Fixtures

Status: `ready`

Depends on: `G002`, `G003`

Purpose: make high-risk governance testable by adding lightweight validation or
dogfood fixtures that prove queues can link a high-risk report and skills can
be quick-validated after the behavior changes.

## G005 - Convert M69 S003 Into Design-Only Delivery Boundary Change

Status: `ready`

Depends on: `G001`

Purpose: apply the high-risk report recommendation by creating a lower-risk
design-only path for skill registry and adapter delivery boundaries, without
moving code or changing generated surfaces.

## G006 - Create Research-Only Compatibility Report For Second Adapter Target

Status: `candidate`

Depends on: `G005`

Purpose: prepare `S007` safely by researching one possible second local skill
target and documenting compatibility constraints without writing adapter code or
generated platform files.

## G007 - Design Dry-Run Multi-Adapter Spike Without Durable Generated Output

Status: `candidate`

Depends on: `G005`, `G006`

Risk: `high`

Purpose: if the design and research reports justify it, define the narrowest
dry-run adapter spike that can test multi-adapter boundaries without committing
second-platform generated surfaces.
