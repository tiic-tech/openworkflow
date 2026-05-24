# Goal

Define the artifact contract for `/ow:proto2html`: accepted benchmark prototype
input to single HTML reconstruction with visual fidelity evidence.

# Read First

- `docs/OW_DEVELOP_PLAN.md`
- `references/proto-redesign-artifact-contracts.md`
- `changes/M68-post-proto-workflow-planning/CANDIDATE_CHANGES.yaml`

# Do

- Add a concise reference document for proto2html artifacts.
- Add a JSON schema for `HTML_PROTOTYPE.yaml`.
- Register the new reference/schema as required repository contract files.
- Mark H001 complete after validation.

# Do Not

- Do not implement `skills/proto2html/`.
- Do not add `/ow:proto2html` to the command registry.
- Do not edit generated `.agents/` or `.openworkflow/` surfaces.
- Do not define html2spec or build milestone contracts in this change.

# Owned Paths

- `references/proto2html-artifact-contracts.md`
- `schemas/html-prototype.schema.json`
- `packages/core/src/validators/validateRepositoryContracts.ts`
- `changes/M68-post-proto-workflow-planning/`
- `changes/M68-post-proto-workflow-planning/H001-proto2html-artifact-contracts/`

# Validation

- `npm run validate`

# Stop Conditions

- Stop if the contract requires changing runtime command behavior.
- Stop if accepted benchmark input semantics cannot be defined without a product decision.
