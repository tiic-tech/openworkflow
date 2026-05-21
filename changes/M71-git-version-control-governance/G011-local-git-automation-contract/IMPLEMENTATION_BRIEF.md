# G011 - Local Git Automation Contract

## Goal

Define the approved local git automation boundary before implementing branch,
commit, or PR-ready summary automation.

## Read First

- `changes/M71-git-version-control-governance/HIGH_RISK_DECISION_REPORT.md`
- `references/git-version-control-governance.md`
- `references/gh-operation-governance.md`
- `references/planning-artifact-contracts.md`

## Do

- Document local-only automation modes.
- Require dry-run or preview before mutation.
- Keep remote push, remote PR creation, Issue mutation, and merge behind
  explicit operation-level approval.
- Record G011 completion evidence.

## Do Not

- Do not implement commands.
- Do not run git mutation commands.
- Do not push, create remote PRs, edit Issues, or merge.

## Owned Paths

- `references/git-version-control-governance.md`
- `references/gh-operation-governance.md`
- `references/planning-artifact-contracts.md`
- `changes/M71-git-version-control-governance/G011-local-git-automation-contract/`

## Validation

- `npm run validate`
- `git diff --check`

## Stop Conditions

- Stop if the contract would authorize remote mutation without explicit approval.
- Stop if the contract would allow local commits without validation evidence.
