# G001 - Git Governance Hierarchy Contract

## Goal

Create the source contract for OW's git version-control hierarchy so later
skills can enforce branch, commit, PR, Issue, and gh behavior without inventing
their own rules.

## Read First

- `references/planning-artifact-contracts.md`
- `changes/M71-git-version-control-governance/CANDIDATE_CHANGES.yaml`

## Do

- Add `references/git-version-control-governance.md`.
- Link the planning artifact contract to the new governance reference.
- Record G001 selection and completion evidence in the M71 queue.
- Keep the change documentation-only.

## Do Not

- Do not change `decompose-to-changes` or `select-change` behavior.
- Do not implement git, gh, PR, or Issue automation.
- Do not edit generated `.agents/**` or `.openworkflow/**` surfaces.

## Owned Paths

- `references/planning-artifact-contracts.md`
- `references/git-version-control-governance.md`
- `changes/M71-git-version-control-governance/G001-git-governance-contract/`

## Validation

- `npm run validate`
- `git diff --check`

## Stop Conditions

- Stop if the contract would require destructive git automation.
- Stop if source skill behavior must change to satisfy this candidate.
