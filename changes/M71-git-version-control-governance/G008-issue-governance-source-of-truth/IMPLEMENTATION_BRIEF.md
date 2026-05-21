# G008 - Issue Governance Source Of Truth

## Goal

Define how OW treats Issues as planning sources and how local artifacts relate
to GitHub Issues when `gh` is available.

## Read First

- `references/planning-artifact-contracts.md`
- `references/git-version-control-governance.md`
- `changes/M71-git-version-control-governance/CANDIDATE_CHANGES.yaml`

## Do

- Add `references/issue-governance.md`.
- Link Issue governance from planning and git governance references.
- Record G008 selection and completion evidence.
- Keep the change documentation-only.

## Do Not

- Do not implement `gh` commands.
- Do not create, edit, close, or comment on remote Issues.
- Do not change source skill behavior or validators.

## Owned Paths

- `references/planning-artifact-contracts.md`
- `references/git-version-control-governance.md`
- `references/issue-governance.md`
- `changes/M71-git-version-control-governance/G008-issue-governance-source-of-truth/`

## Validation

- `npm run validate`
- `git diff --check`

## Stop Conditions

- Stop if Issue governance requires remote GitHub mutation.
- Stop if local artifacts would duplicate GitHub Issue bodies as authoritative content.
