# M134 Final Git Governance Baseline Handoff

Captured at: 2026-05-25T08:23:00+08:00

## Outcome

M134 is the current formal git-governance baseline closure branch. It starts from `origin/main` at
`6612aa3e06996ad0151e3686d0c972677fc892c6`, re-extracts the still-needed governance deltas onto a
fresh branch, publishes draft PR #9 for review, and closes stale draft PR #8 as superseded.

Formal code development can resume from this baseline after the final local C008 evidence commit is
pushed to `origin/codex/m134-git-governance-baseline-closure` and PR #9 reflects the final head.

## Completed Evidence

- C001 inventoried remaining git governance state and classified PR #8 plus old M130/M131/M132/M133 branches.
- C002 extracted the M131 selected-change commit-evidence gate onto M134.
- C003 extracted the M132 strict branch and PR lifecycle gate onto M134.
- C004 decided PR #8 disposition: do not merge; close as superseded after M134 publication.
- C005 prepared `PR_READY_SUMMARY.md` and exact M134 publication commands.
- C006 pushed the M134 branch and created draft PR #9.
- C007 closed PR #8 with the exact C004-approved supersession comment.

## Remote State

- M134 draft PR: https://github.com/tiic-tech/openworkflow/pull/9
- PR #9 state: OPEN
- PR #9 draft: true
- PR #9 base: `main`
- PR #9 current remote head at this checkpoint: `9fedb447759ba20d6670169aee2bdf616ef0d4b3`
- Local branch head before C008 handoff commit: `ae8e68dceb46bb5aba3725839d42782285d65004`
- PR #8 state: CLOSED
- PR #8 merged: false
- PR #8 branch retained: `codex/m130-remaining-pr5-pr7-merge-governance`

## Remaining Remote Gate

The only remaining M134 remote operation is final branch synchronization after C008 local evidence is
committed:

```bash
git push origin codex/m134-git-governance-baseline-closure
```

This is covered by the user's 2026-05-25 highest authorization for all M134 git-governance commands.
It must not merge PR #9, mark PR #9 ready, delete branches, force-push, mutate Issues, rebase,
reset, revert, or perform unrelated remote mutation.

## Validation

Passed:

- `npm run build`
- `node dist/cli/src/index.js summaries --root . --strict --json`
- `git diff --check`

Known red:

- `npm run validate` still fails on historical, non-M134 repository artifacts such as old missing
  atom-task titles, historical local-commit evidence shape, old high-risk report sections, and an
  example prompt-pack shape. The M134-added remote evidence artifact type issue was corrected by
  using planning contract shape for local operation evidence.

Pending after C008 commit:

- `node dist/cli/src/index.js resume --root . --json`
- final `git push origin codex/m134-git-governance-baseline-closure`
- `gh pr view 9 --repo tiic-tech/openworkflow --json number,url,state,isDraft,headRefName,baseRefName,headRefOid,baseRefOid`

## Forbidden Operations Not Performed

- No PR #8 merge.
- No PR #9 merge.
- No mark-ready operation.
- No Issue mutation.
- No branch deletion.
- No force-push.
- No rebase, reset, revert, or branch surgery.
