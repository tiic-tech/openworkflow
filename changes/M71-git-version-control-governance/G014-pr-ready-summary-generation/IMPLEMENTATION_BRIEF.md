# G014 - Local PR-Ready Summary Generation

## Goal

Generate a local `PR_READY_SUMMARY.md` from a candidate queue without opening,
editing, pushing, merging, or approving any remote PR.

## Do

- Read `CANDIDATE_CHANGES.yaml`.
- Summarize completed candidates, selected-change ids, commit evidence,
  remaining candidates, high-risk candidates, and validation evidence.
- Warn clearly when the queue is not fully complete.
- Write only a local markdown artifact.

## Do Not

- Do not push branches.
- Do not create or edit remote PRs.
- Do not edit GitHub Issues.
- Do not add the public command shell; G015 owns that high-risk boundary.

## Owned Paths

- `packages/core/src/git/prReadySummary.ts`
- `packages/cli/src/dev/verifyRuntimeSurface.ts`
- `changes/M71-git-version-control-governance/PR_READY_SUMMARY.md`
- `changes/M71-git-version-control-governance/G014-pr-ready-summary-generation/`

## Validation

- `npm run validate`
- `git diff --check`
- `npm run verify:runtime-surface`

## Stop Conditions

- Stop if generation requires remote GitHub state.
- Stop if the artifact implies a remote PR was opened or approved.
