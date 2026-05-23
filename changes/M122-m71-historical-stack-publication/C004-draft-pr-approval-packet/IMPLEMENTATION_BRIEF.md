# C004 - Approved M71 Draft PR

## Goal

Create one draft PR from `codex/m71-git-version-governance` into `main` and
record local remote-operation evidence.

## Read First

- `changes/M122-m71-historical-stack-publication/C004-draft-pr-approval-packet/DRAFT_PR_APPROVAL_PACKET.md`
- `changes/M122-m71-historical-stack-publication/C004-draft-pr-approval-packet/PR_BODY.md`
- `changes/M122-m71-historical-stack-publication/C003-approved-m71-push/PUSH_EVIDENCE.md`
- `references/gh-operation-governance.md`

## Do

- Verify exact approval text for the C004 draft PR command.
- Verify the remote M71 branch exists at `a0ddcf94b0f856a92218ef07fd323d3eb5bae0a1`.
- Verify no existing M71 PR exists before creation.
- Create one draft PR and record the resulting URL, number, draft state, head, and base.

## Do Not

- Do not mark the PR ready for review.
- Do not merge, edit after creation, close, retarget, or comment on any PR.
- Do not mutate Issues, push, force-push, rebase, reset, cherry-pick, split branches, or delete branches.

## Owned Paths

- `changes/M122-m71-historical-stack-publication/`

## Validation

- `gh pr view 6 --repo tiic-tech/openworkflow --json number,url,state,isDraft,title,headRefName,baseRefName,headRefOid,baseRefOid,mergeable,reviewDecision,statusCheckRollup`
- `git diff --check`

## Stop Conditions

- Stop if approval text does not exactly name the C004 draft PR command.
- Stop if a PR already exists for `codex/m71-git-version-governance`.
- Stop if the command would create a non-draft PR.
- Stop before ready-for-review conversion, merge, PR edit after creation, PR close, Issue mutation, push, rebase, reset, force-push, or branch deletion.
