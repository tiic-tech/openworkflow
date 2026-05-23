# C001 - PR #7 Readiness Preflight

## Goal

Refresh current read-only readiness facts for PR #7 before any
ready-for-review mutation is considered.

## Read First

- `changes/M127-m101-shared-stack-ready-review-governance/C001-pr7-readiness-preflight/SELECTED_CHANGE.yaml`
- `changes/M127-m101-shared-stack-ready-review-governance/C001-pr7-readiness-preflight/ATOM_TASKS.yaml`
- `changes/M127-m101-shared-stack-ready-review-governance/CANDIDATE_CHANGES.yaml`
- `changes/M127-m101-shared-stack-ready-review-governance/SUMMARY.yaml`

## Do

- Inspect PR #7 metadata.
- Verify the remote head branch exists at the PR head OID.
- Record whether C002 can prepare the ready-for-review decision packet.

## Do Not

- Do not run `gh pr ready`.
- Do not edit, close, merge, retarget, request review, or comment on PR #7.
- Do not mutate Issues.
- Do not push, force-push, rebase, reset, delete branches, or perform branch surgery.
- Do not perform shared-stack split/surgery.
- Do not change product source.

## Owned Paths

- `changes/M127-m101-shared-stack-ready-review-governance/`

## Validation

- `gh pr view 7 --repo tiic-tech/openworkflow --json number,url,state,isDraft,title,headRefName,baseRefName,headRefOid,baseRefOid,mergeable,reviewDecision,statusCheckRollup`
- `git ls-remote --heads origin codex/m101-build-proto-prompt-command-split`
- `node dist/cli/src/index.js validate --root . --json`
- `git diff --check`

## Stop Conditions

- Stop before any command that mutates PR #7, Issues, remote branches, or local git history.
- Stop if PR #7 is not open, no longer points at `codex/m101-build-proto-prompt-command-split`, or the remote head branch does not match the PR head OID.
- Stop before C002 or C003 unless C001 completion evidence is recorded.
