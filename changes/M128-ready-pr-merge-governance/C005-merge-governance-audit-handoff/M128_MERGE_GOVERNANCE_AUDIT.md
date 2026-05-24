# M128 Merge Governance Audit Handoff

Captured at: 2026-05-24T17:35:42+08:00

## Final State

M128 is complete.

M128 merged exactly one PR:

- PR: #6
- URL: https://github.com/tiic-tech/openworkflow/pull/6
- Final state: `MERGED`
- Merged at: `2026-05-24T09:31:55Z`
- Merge commit: `8656ed135c7a57c5b515572fa06bc082aabdcb95`
- Head branch: `codex/m71-git-version-governance`
- Head OID: `a0ddcf94b0f856a92218ef07fd323d3eb5bae0a1`
- Head branch preserved on origin: yes

Remote `main` after merge:

- `refs/heads/main`: `8656ed135c7a57c5b515572fa06bc082aabdcb95`

## Candidate Summary

### C001

Status: done

C001 refreshed merge-readiness for PR #4, PR #5, PR #6, and PR #7. All four were open, non-draft, mergeable, had matching remote head refs, and returned clean merge-tree probes.

Evidence:

- `C001-refresh-ready-pr-merge-readiness-inventory/MERGE_READINESS_INVENTORY.md`

### C002

Status: done

C002 selected PR #6 as the first merge target because its 66-commit head was the common ancestor of PR #4, PR #5, and PR #7.

Evidence:

- `C002-decide-first-merge-target-and-stop-gates/FIRST_MERGE_TARGET_DECISION.md`

### C003

Status: done

C003 prepared the high-risk PR #6 merge decision packet. It recorded the exact C004 approval gate and did not run `gh pr merge`.

Evidence:

- `HIGH_RISK_DECISION_REPORT.md`

### C004

Status: done

C004 received exact approval and ran only the approved PR #6 merge command:

```bash
gh pr merge 6 --repo tiic-tech/openworkflow --merge --match-head-commit a0ddcf94b0f856a92218ef07fd323d3eb5bae0a1
```

Evidence:

- `C004-approved-pr6-merge/MERGE_EVIDENCE.md`

## Remaining PRs

The remaining open PRs are:

| PR | Branch | Head OID | Draft | Mergeable Signal |
| --- | --- | --- | --- | --- |
| #4 | `codex/m102-selected-change-commit-gate` | `bd2780b1d5b117b2734e5b732164e5d299bd521a` | false | MERGEABLE |
| #5 | `codex/m117-git-automation-remote-readiness` | `898f0152a4e3e026ee5dcc78d4ef585c722a37b7` | false | MERGEABLE |
| #7 | `codex/m101-build-proto-prompt-command-split` | `f8bf087211316506f48155859f3e18edbc7224e4` | false | MERGEABLE |

GitHub PR metadata still reports the original `baseRefOid` for these PRs, while remote `main` now points at `8656ed135c7a57c5b515572fa06bc082aabdcb95`. A follow-up queue must refresh their merge-readiness against the new `main` before preparing any additional merge decision packet.

## Unauthorized Operations Not Performed

- No PR #4 merge.
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

- Suggested plan id: `M129-remaining-ready-pr-merge-governance`
- Initial scope: refresh PR #4, PR #5, and PR #7 against remote `main` at `8656ed135c7a57c5b515572fa06bc082aabdcb95`
- First candidate: read-only merge-readiness refresh
- Stop before any merge until a new high-risk decision packet and exact operation-level approval exist

Shared-stack split or branch-surgery remains outside this handoff and requires a separate high-risk queue if review rejects the shared PR #7 path.
