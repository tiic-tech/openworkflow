# C003 - Approved M71 Branch Push

## Goal

Execute the exact approved push for `codex/m71-git-version-governance` and
record local remote-operation evidence.

## Read First

- `changes/M122-m71-historical-stack-publication/HIGH_RISK_DECISION_REPORT.md`
- `changes/M122-m71-historical-stack-publication/C002-prepare-m71-push-decision-preflight/WORKTREE_PREFLIGHT.md`
- `references/git-version-control-governance.md`
- `references/gh-operation-governance.md`

## Do

- Verify exact approval text for the C003 push.
- Verify the isolated M71 worktree is clean and still at
  `a0ddcf94b0f856a92218ef07fd323d3eb5bae0a1`.
- Push only `HEAD` to `refs/heads/codex/m71-git-version-governance`.
- Record the resulting remote branch head and rollback guidance.

## Do Not

- Do not create a draft PR.
- Do not mark any PR ready for review.
- Do not merge, edit, close, retarget, or comment on any PR.
- Do not mutate Issues, force-push, rebase, reset, cherry-pick, split branches, or delete branches.

## Owned Paths

- `changes/M122-m71-historical-stack-publication/`

## Validation

- `git ls-remote --heads origin codex/m71-git-version-governance`
- `gh pr list --repo tiic-tech/openworkflow --head codex/m71-git-version-governance --state all --json number,url,state,isDraft,title,headRefName,baseRefName,headRefOid,baseRefOid`
- `git diff --check`

## Stop Conditions

- Stop if approval text does not exactly name the C003 push command.
- Stop if local M71 head differs from `a0ddcf94b0f856a92218ef07fd323d3eb5bae0a1`.
- Stop if a remote branch exists before push at a different head.
- Stop before draft PR creation unless the user separately approves C004.
