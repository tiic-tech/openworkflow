# Goal

Add source behavior for proto2html: accepted benchmark prototype evidence to
single-file HTML reconstruction with fidelity evidence.

# Read First

- `references/proto2html-artifact-contracts.md`
- `schemas/html-prototype.schema.json`
- `changes/M68-post-proto-workflow-planning/CANDIDATE_CHANGES.yaml`

# Do

- Create `skills/proto2html/`.
- Require accepted benchmark image or screen-group evidence.
- Define single-file HTML reconstruction behavior.
- Define screenshot and fidelity-report evidence expectations.

# Do Not

- Do not add `/ow:proto2html` to command registry.
- Do not edit `.agents/` or `.openworkflow/`.
- Do not create html2spec behavior.
- Do not turn proto2html into product exploration or production implementation.

# Owned Paths

- `skills/proto2html/`
- `changes/M68-post-proto-workflow-planning/H002-proto2html-source-behavior/`
- `changes/M68-post-proto-workflow-planning/`

# Validation

- `python3 /Users/archy/.codex/skills/.system/skill-creator/scripts/quick_validate.py skills/proto2html`
- `npm run validate`

# Stop Conditions

- Stop if source behavior requires runtime command exposure.
- Stop if accepted benchmark semantics need a new product decision beyond H001.
