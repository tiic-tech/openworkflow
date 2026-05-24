# M130 C001 Implementation Brief

## Goal

Refresh read-only merge-readiness evidence for PR #5 and PR #7 against
`origin/main` at `b77418e2fe9b1f6eda213e52f495364bb1861e94`, then decide
whether C002 can choose the next merge target.

## Read First

- `changes/M130-remaining-pr5-pr7-merge-governance/CANDIDATE_CHANGES.yaml`
- `changes/M130-remaining-pr5-pr7-merge-governance/SUMMARY.yaml`
- `changes/M130-remaining-pr5-pr7-merge-governance/C001-refresh-pr5-pr7-merge-readiness/SELECTED_CHANGE.yaml`
- `changes/M130-remaining-pr5-pr7-merge-governance/C001-refresh-pr5-pr7-merge-readiness/ATOM_TASKS.yaml`

## Do

- Record current PR API metadata for PR #5 and PR #7.
- Verify remote branch OIDs match PR head OIDs.
- Fetch `origin/main` locally for read-only merge calculations.
- Record ancestry, ahead/behind, merge-base, PR #7 to PR #5 ancestry, and
  merge-tree results.
- Mark C001 done and make C002 ready only if the evidence supports target
  sequencing.

## Do Not

- Do not run `gh pr merge`.
- Do not push, force-push, rebase, reset, delete branches, or perform branch
  surgery.
- Do not edit PRs, close PRs, request reviews, comment on PRs, or mutate
  Issues.
- Do not change product source files, generated OpenWorkflow surfaces, or
  non-M130 planning artifacts.

## Owned Paths

- `changes/M130-remaining-pr5-pr7-merge-governance/`

## Validation

- `gh pr list --repo tiic-tech/openworkflow --state open --json number,url,title,isDraft,headRefName,baseRefName,headRefOid,baseRefOid,mergeable,reviewDecision,statusCheckRollup --limit 20`
- `git ls-remote origin refs/heads/main refs/heads/codex/m117-git-automation-remote-readiness refs/heads/codex/m101-build-proto-prompt-command-split`
- `git fetch origin main`
- `git merge-tree --write-tree origin/main <head-oid>`
- `node dist/cli/src/index.js validate --root . --json`
- `git diff --check`

## Stop Conditions

- Any PR head branch no longer exists or differs from the PR API head OID.
- PR #5 or PR #7 becomes draft, closed, unmergeable, or gains failing required
  checks.
- `merge-tree` reports conflicts for both remaining PRs.
- The user asks for a remote mutation without an exact high-risk decision
  packet and approval.
