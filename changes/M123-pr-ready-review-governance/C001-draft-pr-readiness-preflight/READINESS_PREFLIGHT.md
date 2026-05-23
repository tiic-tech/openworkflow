# C001 Draft PR Readiness Preflight

Captured at: `2026-05-23T20:39:29+08:00`

## Scope

This packet is read-only evidence for M123. It does not approve or execute any
ready-for-review transition.

## Commands Run

- `git status --short --branch`
- `gh pr view 5 --repo tiic-tech/openworkflow --json number,url,state,isDraft,title,headRefName,baseRefName,headRefOid,baseRefOid,mergeable,reviewDecision,statusCheckRollup`
- `gh pr view 4 --repo tiic-tech/openworkflow --json number,url,state,isDraft,title,headRefName,baseRefName,headRefOid,baseRefOid,mergeable,reviewDecision,statusCheckRollup`
- `git ls-remote --heads origin codex/m117-git-automation-remote-readiness codex/m102-selected-change-commit-gate`

## Git State

- Current branch: `codex/m123-pr-ready-review-governance`
- Working tree before edits: clean
- M123 branch boundary: satisfied

## PR #5

- URL: `https://github.com/tiic-tech/openworkflow/pull/5`
- Title: `M117: Git automation remote readiness governance`
- State: `OPEN`
- Draft: `true`
- Base: `main` at `d0e13f4bba3a847b763d2db3f771659aac3a4fe5`
- Head: `codex/m117-git-automation-remote-readiness` at `898f0152a4e3e026ee5dcc78d4ef585c722a37b7`
- Remote head: `898f0152a4e3e026ee5dcc78d4ef585c722a37b7`
- Remote head matches PR head: yes
- Mergeability signal: `MERGEABLE`
- Review decision: empty
- Status check rollup: empty

## PR #4

- URL: `https://github.com/tiic-tech/openworkflow/pull/4`
- Title: `OpenWorkflow M102-selected-change-commit-gate`
- State: `OPEN`
- Draft: `true`
- Base: `main` at `d0e13f4bba3a847b763d2db3f771659aac3a4fe5`
- Head: `codex/m102-selected-change-commit-gate` at `bd2780b1d5b117b2734e5b732164e5d299bd521a`
- Remote head: `bd2780b1d5b117b2734e5b732164e5d299bd521a`
- Remote head matches PR head: yes
- Mergeability signal: `MERGEABLE`
- Review decision: empty
- Status check rollup: empty

## Recommendation

Proceed to C002 next: prepare the exact PR #5 ready-for-review decision packet
for `gh pr ready 5 --repo tiic-tech/openworkflow`.

Reasoning:

- PR #5 is the M121/M117 publication output and is already the recommended first
  target in M123.
- PR #5 is open, still draft, mergeable, and its remote branch head matches the
  PR head OID.
- PR #4 remains open and draft, but belongs to the older M102 flow and should be
  handled only after PR #5 has an explicit decision packet or review outcome.

## Stop Gates

- Do not run `gh pr ready 5 --repo tiic-tech/openworkflow` without exact user approval.
- Do not run `gh pr ready 4 --repo tiic-tech/openworkflow` without separate exact user approval.
- Do not merge, close, edit, retarget, or otherwise mutate either PR from C001.
- Do not push, force-push, delete branches, rebase, reset, mutate Issues, or change source files.
