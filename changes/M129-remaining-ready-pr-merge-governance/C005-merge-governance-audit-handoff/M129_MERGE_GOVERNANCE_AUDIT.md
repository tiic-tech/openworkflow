# M129 Merge Governance Audit Handoff

Captured at: 2026-05-25T00:25:26+08:00

## Final State

M129 is complete.

M129 merged exactly one PR:

- PR: #4
- URL: https://github.com/tiic-tech/openworkflow/pull/4
- Final state: `MERGED`
- Merged at: `2026-05-24T16:20:31Z`
- Merge commit: `b77418e2fe9b1f6eda213e52f495364bb1861e94`
- Head branch: `codex/m102-selected-change-commit-gate`
- Head OID: `bd2780b1d5b117b2734e5b732164e5d299bd521a`
- Head branch preserved on origin: yes

Remote `main` after merge:

- `refs/heads/main`: `b77418e2fe9b1f6eda213e52f495364bb1861e94`

## Candidate Summary

### C001

Status: done

C001 refreshed merge-readiness for PR #4, PR #5, and PR #7 after PR #6 changed `main`. All three were open, non-draft, had matching remote head refs, and returned clean merge-tree probes against `origin/main`.

Evidence:

- `C001-refresh-remaining-pr-merge-readiness/MERGE_READINESS_REFRESH.md`

### C002

Status: done

C002 selected PR #4 as the next merge target because it was independent from PR #5/#7 in the observed ancestry matrix and had the smallest ahead count. It did not approve a merge.

Evidence:

- `C002-decide-next-remaining-pr-merge-target/NEXT_MERGE_TARGET_DECISION.md`

### C003

Status: done

C003 prepared the high-risk PR #4 merge decision packet. It recorded the exact C004 approval gate and did not run `gh pr merge`.

Evidence:

- `HIGH_RISK_DECISION_REPORT.md`

### C004

Status: done

C004 received exact approval and ran only the approved PR #4 merge command:

```bash
gh pr merge 4 --repo tiic-tech/openworkflow --merge --match-head-commit bd2780b1d5b117b2734e5b732164e5d299bd521a
```

Evidence:

- `C004-approved-pr4-merge/MERGE_EVIDENCE.md`

## Remaining PRs

The remaining open PRs are:

| PR | Branch | Head OID | Draft | Mergeable Signal |
| --- | --- | --- | --- | --- |
| #5 | `codex/m117-git-automation-remote-readiness` | `898f0152a4e3e026ee5dcc78d4ef585c722a37b7` | false | MERGEABLE |
| #7 | `codex/m101-build-proto-prompt-command-split` | `f8bf087211316506f48155859f3e18edbc7224e4` | false | MERGEABLE |

GitHub PR metadata still reports the older `baseRefOid` `d0e13f4bba3a847b763d2db3f771659aac3a4fe5` for these PRs, while remote `main` now points at `b77418e2fe9b1f6eda213e52f495364bb1861e94`. A follow-up queue must refresh merge-readiness against this new `main` before preparing any additional merge decision packet.

## Unauthorized Operations Not Performed

- No PR #5 merge.
- No PR #7 merge.
- No push or force-push.
- No PR body edit, close, retarget, comment, or review request.
- No Issue mutation.
- No branch checkout, branch deletion, rebase, reset, split/surgery, or destructive local git operation.
- No product source change.
- No automatic rollback or revert.

## Next Recommended Boundary

Open a new queue for remaining ready PR merge governance:

- Suggested plan id: `M130-remaining-pr5-pr7-merge-governance`
- Initial scope: refresh PR #5 and PR #7 against remote `main` at `b77418e2fe9b1f6eda213e52f495364bb1861e94`
- First candidate: read-only merge-readiness refresh
- Stop before any merge until a new high-risk decision packet and exact operation-level approval exist

PR #7 remains the shared M101-derived stack and is still an ancestor of PR #5 in the prior M129 evidence. If that relationship persists, PR #7 should be considered before PR #5 unless a later decision explicitly chooses a folded PR #7 plus PR #5 integration path.

Shared-stack split or branch-surgery remains outside this handoff and requires a separate high-risk queue if review rejects the shared PR #7 path.
