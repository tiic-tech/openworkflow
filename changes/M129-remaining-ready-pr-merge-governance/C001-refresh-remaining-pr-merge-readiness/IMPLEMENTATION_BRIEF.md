# M129 C001 Implementation Brief

## Goal

Refresh read-only merge-readiness evidence for PR #4, PR #5, and PR #7 against the new `origin/main` head `8656ed135c7a57c5b515572fa06bc082aabdcb95`, then unlock C002 for next-target sequencing.

## Read First

- `changes/M129-remaining-ready-pr-merge-governance/CANDIDATE_CHANGES.yaml`
- `changes/M129-remaining-ready-pr-merge-governance/SUMMARY.yaml`
- `changes/M129-remaining-ready-pr-merge-governance/C001-refresh-remaining-pr-merge-readiness/MERGE_READINESS_REFRESH.md`

## Do

- Record current PR API metadata for PR #4, PR #5, and PR #7.
- Verify remote branch OIDs match PR head OIDs.
- Fetch `origin/main` locally for read-only merge calculations.
- Record ancestry, ahead/behind, merge-base, and merge-tree results.
- Mark C001 done and make C002 ready if the evidence is sufficient.

## Do Not

- Do not run `gh pr merge`.
- Do not push, force-push, rebase, reset, checkout, delete branches, or perform branch surgery.
- Do not edit PRs, close PRs, request reviews, comment on PRs, or mutate Issues.
- Do not change product source files or generated OpenWorkflow surfaces.

## Owned Paths

- `changes/M129-remaining-ready-pr-merge-governance/`

## Validation

- `gh pr list --repo tiic-tech/openworkflow --state open --json number,url,title,isDraft,headRefName,baseRefName,headRefOid,baseRefOid,mergeable,reviewDecision,statusCheckRollup --limit 20`
- `git ls-remote origin refs/heads/main refs/heads/codex/m102-selected-change-commit-gate refs/heads/codex/m117-git-automation-remote-readiness refs/heads/codex/m101-build-proto-prompt-command-split`
- `git fetch origin main`
- `git merge-tree --write-tree origin/main <head-oid>`
- `node dist/cli/src/index.js validate --root . --json`
- `git diff --check`

## Stop Conditions

- Any PR head branch no longer exists or differs from the PR API head OID.
- Any selected PR becomes draft, closed, unmergeable, or gains failing required checks.
- `merge-tree` reports conflicts for all remaining PRs.
- The user asks for a remote mutation without an exact high-risk decision packet and approval.
