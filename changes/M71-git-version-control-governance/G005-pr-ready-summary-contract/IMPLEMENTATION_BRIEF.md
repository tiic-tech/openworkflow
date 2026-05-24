# G005 - PR-Ready Summary Contract

## Goal

Define the artifact an agent can use to prepare a feat branch for PR review
without opening or mutating a remote pull request.

## Read First

- `references/planning-artifact-contracts.md`
- `references/git-version-control-governance.md`

## Do

- Add `PR_READY_SUMMARY.md` to planning artifact contracts.
- Clarify PR boundary expectations in git governance.
- Record G005 completion evidence.

## Do Not

- Do not call GitHub APIs.
- Do not create, edit, or open a PR.
- Do not implement release automation.

## Owned Paths

- `references/planning-artifact-contracts.md`
- `references/git-version-control-governance.md`
- `changes/M71-git-version-control-governance/G005-pr-ready-summary-contract/`

## Validation

- `npm run validate`
- `git diff --check`

## Stop Conditions

- Stop if the artifact contract implies remote PR mutation.
- Stop if the contract requires GitHub as the only PR provider.
