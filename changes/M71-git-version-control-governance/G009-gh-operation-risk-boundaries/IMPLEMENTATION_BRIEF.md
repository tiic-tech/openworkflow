# G009 - Gh Operation Risk Boundaries

## Goal

Define how OW classifies gh issue and PR operations before any remote mutation
automation is considered.

## Read First

- `references/git-version-control-governance.md`
- `references/issue-governance.md`

## Do

- Add `references/gh-operation-governance.md`.
- Link gh operation governance from git and Issue references.
- Record G009 completion evidence.

## Do Not

- Do not run gh commands.
- Do not create, edit, close, or comment on Issues.
- Do not open or edit PRs.

## Owned Paths

- `references/git-version-control-governance.md`
- `references/issue-governance.md`
- `references/gh-operation-governance.md`
- `changes/M71-git-version-control-governance/G009-gh-operation-risk-boundaries/`

## Validation

- `npm run validate`
- `git diff --check`

## Stop Conditions

- Stop if classification would require remote GitHub access.
- Stop if a mutation operation is needed before high-risk approval.
