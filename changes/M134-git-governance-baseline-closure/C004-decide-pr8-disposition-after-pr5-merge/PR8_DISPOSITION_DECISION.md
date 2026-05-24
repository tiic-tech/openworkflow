# M134 C004 PR #8 Disposition Decision

Captured at: 2026-05-25T03:31:00+08:00

## Current PR #8 State

- PR: #8
- URL: https://github.com/tiic-tech/openworkflow/pull/8
- State: OPEN
- Draft: true
- Title: M130 remaining PR #5/#7 merge governance
- Head branch: `codex/m130-remaining-pr5-pr7-merge-governance`
- Head OID: `d69eefca8b7d9ae3d510ed47f3e4815a07b74613`
- Base branch: `main`
- API base OID: `f98c2013bdb0a50fa5983c6f0ee08cd3fa32e444`
- Mergeable signal: MERGEABLE
- Review decision: empty
- Status checks: empty

## Classification

PR #8 is stale as an integration target. Its body is the M130 merge-governance audit handoff captured before PR #5 merged. Since then:

- PR #7 merged into main at `f98c2013bdb0a50fa5983c6f0ee08cd3fa32e444`.
- PR #5 merged into main at `6612aa3e06996ad0151e3686d0c972677fc892c6`.
- M134 was created from current `origin/main` at `6612aa3e06996ad0151e3686d0c972677fc892c6`.
- M134 extracted the still-needed M131/M132 source governance deltas onto a fresh branch.

PR #8 is not an ancestor of current `origin/main`; `git merge-base --is-ancestor d69eefca8b7d9ae3d510ed47f3e4815a07b74613 origin/main` returned `1`.

The PR #8 branch still contains old stacked audit/planning artifacts and historical commits that M134 intentionally did not import wholesale.

## Decision

Do not merge PR #8.

Do not update PR #8 before M134 publication.

After M134 is published as its own draft PR, close PR #8 as superseded by the M134 baseline closure PR and record the close evidence in C007. Closing should not delete the remote branch.

## Future Approval Handle

After C006 records the M134 draft PR URL, C007 may run only this PR #8 cleanup mutation:

```bash
gh pr close 8 --repo tiic-tech/openworkflow --comment "Superseded by the M134 git governance baseline closure draft PR after PR #5 merged. M134 re-extracts the still-needed governance deltas onto a fresh main-based branch and keeps local audit evidence under changes/M134-git-governance-baseline-closure/."
```

Forbidden with that handle:

- do not merge PR #8
- do not delete the PR #8 branch
- do not force-push
- do not edit Issues
- do not rebase, reset, revert, or perform branch surgery
- do not run any other remote mutation

## C004 Remote Mutation

None. C004 performed read-only GitHub and git inspection only.
