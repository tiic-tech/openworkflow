# C001 - PR #4 Readiness Preflight

## Goal

Refresh current read-only readiness facts for PR #4 before any
ready-for-review mutation is considered.

## Do

- Inspect PR #4 metadata.
- Verify the remote head branch exists at the PR head OID.
- Record whether C002 can prepare the ready-for-review decision packet.

## Do Not

- Do not run `gh pr ready`.
- Do not edit, close, merge, retarget, or comment on PR #4.
- Do not mutate Issues.
- Do not push or perform branch surgery.

## Validation

- `gh pr view 4 --repo tiic-tech/openworkflow --json number,url,state,isDraft,title,headRefName,baseRefName,headRefOid,baseRefOid,mergeable,reviewDecision,statusCheckRollup`
- `git ls-remote --heads origin codex/m102-selected-change-commit-gate`
- `node dist/cli/src/index.js validate --root . --json`
- `git diff --check`
