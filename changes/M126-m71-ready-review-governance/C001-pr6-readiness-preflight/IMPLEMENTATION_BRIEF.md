# C001 - PR #6 Readiness Preflight

## Goal

Refresh current read-only readiness facts for PR #6 before any
ready-for-review mutation is considered.

## Read First

- `changes/M126-m71-ready-review-governance/C001-pr6-readiness-preflight/SELECTED_CHANGE.yaml`
- `changes/M126-m71-ready-review-governance/C001-pr6-readiness-preflight/ATOM_TASKS.yaml`
- `changes/M126-m71-ready-review-governance/CANDIDATE_CHANGES.yaml`
- `changes/M126-m71-ready-review-governance/SUMMARY.yaml`

## Do

- Inspect PR #6 metadata.
- Verify the remote head branch exists at the PR head OID.
- Record whether C002 can prepare the ready-for-review decision packet.

## Do Not

- Do not run `gh pr ready`.
- Do not edit, close, merge, retarget, request review, or comment on PR #6.
- Do not mutate Issues.
- Do not push, force-push, rebase, reset, delete branches, or perform branch surgery.
- Do not change product source.

## Owned Paths

- `changes/M126-m71-ready-review-governance/`

## Validation

- `gh pr view 6 --repo tiic-tech/openworkflow --json number,url,state,isDraft,title,headRefName,baseRefName,headRefOid,baseRefOid,mergeable,reviewDecision,statusCheckRollup`
- `git ls-remote --heads origin codex/m71-git-version-governance`
- `node dist/cli/src/index.js validate --root . --json`
- `git diff --check`

## Stop Conditions

- Stop before any command that mutates PR #6, Issues, remote branches, or local git history.
- Stop if PR #6 is not open, no longer points at `codex/m71-git-version-governance`, or the remote head branch does not match the PR head OID.
- Stop before C002 or C003 unless C001 completion evidence is recorded.
