# G013 - Selected-Change Local Commit Automation

## Goal

Implement the approved local-only primitive that commits a completed selected
change after validation evidence exists.

## Decision Applied

A selected change must have at least one local commit. It may have multiple
commits when a follow-up evidence commit is needed. Do not amend to force a
self-referential commit hash into the primary implementation commit.

## Do

- Require plan id, candidate id, selected change id, allowed paths, validation
  evidence, and a commit message.
- Refuse dirty paths outside the selected change's allowed paths.
- Refuse branch-boundary mismatches when a branch boundary is supplied.
- Require the commit message to include the plan id and candidate id.
- Support dry-run preview.
- Create a primary local commit, then optionally write commit evidence and
  create a follow-up evidence commit.

## Do Not

- Do not push commits.
- Do not create remote PRs.
- Do not edit GitHub Issues.
- Do not amend commits.
- Do not reset, rebase, merge, stash, restore, or clean.
- Do not add the public command surface; G015 owns that high-risk boundary.

## Owned Paths

- `packages/core/src/git/localGitAutomation.ts`
- `packages/cli/src/dev/verifyRuntimeSurface.ts`
- `references/git-version-control-governance.md`
- `changes/M71-git-version-control-governance/G013-selected-change-commit-automation/`

## Validation

- `npm run validate`
- `git diff --check`
- `npm run verify:runtime-surface`

## Stop Conditions

- Stop if the implementation needs remote state or authenticated GitHub access.
- Stop if commit evidence requires amend or history rewriting.
- Stop if unrelated dirty paths must be included to make the commit work.
