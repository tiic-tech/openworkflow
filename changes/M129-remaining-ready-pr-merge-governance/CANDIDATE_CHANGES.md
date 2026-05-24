# M129 Remaining Ready PR Merge Governance

Source of truth: `CANDIDATE_CHANGES.yaml`.

M129 starts after M128 merged PR #6 into `main` at `8656ed135c7a57c5b515572fa06bc082aabdcb95`. It owns the next refreshed merge-governance slice for PR #4, PR #5, and PR #7.

M129 is complete. C001 refreshed read-only merge-readiness facts, C002 selected PR #4, C003 prepared the PR #4 high-risk merge decision packet, C004 merged PR #4 with exact approval, and C005 recorded final audit handoff.

## Boundary

- Branch boundary: `codex/m129-remaining-ready-pr-merge-governance`
- Current branch exception: planning was created on `codex/m122-m71-historical-stack-publication`
- Next recommended candidate: none
- Remote/base: `origin` / `main`
- Current remote main: `8656ed135c7a57c5b515572fa06bc082aabdcb95`

In scope: read-only merge-readiness refresh against the new main, next target sequencing, exact approval packet, one approved merge if later authorized, and audit handoff.

Out of scope: merge during DTC, push, PR edits, retargeting, closing, review requests, Issue mutation, force-push, rebase, reset, branch deletion, split/surgery, reverting PR #6, and product source changes.

## Remaining Open PRs

| PR | Branch | State | Draft | Mergeable | Note |
| --- | --- | --- | --- | --- | --- |
| #4 | `codex/m102-selected-change-commit-gate` | OPEN | false | MERGEABLE | Needs refresh against new `main` |
| #5 | `codex/m117-git-automation-remote-readiness` | OPEN | false | MERGEABLE | Needs refresh against new `main` |
| #7 | `codex/m101-build-proto-prompt-command-split` | OPEN | false | MERGEABLE | Needs refresh against new `main` |

GitHub PR metadata still reports the older base OID for these PRs. C001 refreshed against the actual remote `main` head before any target choice.

## C001 Result

Captured: `2026-05-24T18:21:14+08:00`

Evidence: `C001-refresh-remaining-pr-merge-readiness/MERGE_READINESS_REFRESH.md`

- Actual remote/local `origin/main`: `8656ed135c7a57c5b515572fa06bc082aabdcb95`
- PR API `baseRefOid` for PR #4, PR #5, and PR #7 still reports old `d0e13f4bba3a847b763d2db3f771659aac3a4fe5`
- Remote head branches match PR API head OIDs for PR #4, PR #5, and PR #7
- PR #4, PR #5, and PR #7 remain open, non-draft, API-mergeable, with no status checks reported
- All three PR heads are one commit behind new `origin/main`
- `git merge-tree --write-tree origin/main <head-oid>` exited `0` for all three PRs
- C002 can now choose the next merge target; C001 does not choose or approve a merge

## C002 Result

Captured: `2026-05-25T00:11:11+08:00`

Evidence: `C002-decide-next-remaining-pr-merge-target/NEXT_MERGE_TARGET_DECISION.md`

- Recommended next target: PR #4, `OpenWorkflow M102-selected-change-commit-gate`
- PR #4 head: `bd2780b1d5b117b2734e5b732164e5d299bd521a`
- PR #4 is independent from PR #5/#7 in the observed ancestry matrix
- PR #4 has the smallest ahead count among remaining PRs: 137 ahead, 1 behind new `origin/main`
- PR #7 is an ancestor of PR #5, so PR #5 is deferred unless a later decision explicitly chooses a folded PR #7 plus PR #5 path
- C002 does not approve merge execution

Required exact approval for C003 packet preparation:

`Approve M129 C003 decision packet: prepare PR #4 merge high-risk decision packet; do not run gh pr merge, push, edit PRs, mutate Issues, or perform branch surgery.`

## C003 Result

Captured: `2026-05-25T00:16:05+08:00`

Evidence: `HIGH_RISK_DECISION_REPORT.md`

- Prepared PR #4 merge high-risk decision packet.
- Proposed C004 command: `gh pr merge 4 --repo tiic-tech/openworkflow --merge --match-head-commit bd2780b1d5b117b2734e5b732164e5d299bd521a`
- PR #4 remains `OPEN`, non-draft, `MERGEABLE`, with no reported checks.
- Remote PR #4 head branch still matches `bd2780b1d5b117b2734e5b732164e5d299bd521a`.
- Merge-tree against current `origin/main` exited `0` with tree `4961e0e6a803ce623db2faacbf9476c2cc8aff52`.
- C003 did not run `gh pr merge` and did not perform any remote mutation.

Required exact approval for C004 merge execution:

`Approve M129 C004 merge PR #4: run gh pr merge 4 --repo tiic-tech/openworkflow --merge --match-head-commit bd2780b1d5b117b2734e5b732164e5d299bd521a`

## C004 Result

Captured: `2026-05-25T00:20:50+08:00`

Evidence: `C004-approved-pr4-merge/MERGE_EVIDENCE.md`

- Executed exact approved command: `gh pr merge 4 --repo tiic-tech/openworkflow --merge --match-head-commit bd2780b1d5b117b2734e5b732164e5d299bd521a`
- PR #4 state: `MERGED`
- Merge commit: `b77418e2fe9b1f6eda213e52f495364bb1861e94`
- Merged at: `2026-05-24T16:20:31Z`
- Remote `main` after merge: `b77418e2fe9b1f6eda213e52f495364bb1861e94`
- Remaining open PRs: #5 and #7
- No additional PR was merged; no push, PR edit, Issue mutation, or branch surgery was performed

## C005 Result

Captured: `2026-05-25T00:25:26+08:00`

Evidence: `C005-merge-governance-audit-handoff/M129_MERGE_GOVERNANCE_AUDIT.md`

- M129 final state: complete
- Merged exactly one PR: #4
- Remote `main`: `b77418e2fe9b1f6eda213e52f495364bb1861e94`
- Remaining open PRs: #5 and #7
- #5 and #7 currently report `MERGEABLE`, but must be refreshed against `main` at `b77418e2fe9b1f6eda213e52f495364bb1861e94` before any later merge packet
- Suggested next queue: `M130-remaining-pr5-pr7-merge-governance`

## Candidates

### C001 - Refresh remaining PR merge-readiness against new main

Status: done  
Risk: medium

Refresh current read-only PR, branch, base, mergeability, review, check, ancestry, and merge-tree facts for PR #4, PR #5, and PR #7 after PR #6 changed `main`.

Acceptance:

- Current merge-readiness facts are recorded for PR #4, PR #5, and PR #7.
- The packet states whether C002 can choose a next merge target.
- No remote mutation or destructive git operation occurs.

### C002 - Decide next remaining PR merge target and stop gates

Status: done  
Risk: medium

Use C001 evidence to recommend exactly one next merge target or stop with blockers.

Acceptance:

- Exactly one next merge target is recommended, or blockers are recorded.
- Deferred PRs remain open and untouched.
- The decision packet does not approve merge execution.

### C003 - Prepare exact merge approval packet for next target

Status: done  
Risk: high

Prepare the high-risk merge decision report for only the C002-selected PR #4. This still requires exact user approval before selection/execution, and it does not authorize `gh pr merge`.

Acceptance:

- `HIGH_RISK_DECISION_REPORT.md` names the selected PR and exact merge command.
- The report records required exact user approval text.
- No merge or other remote mutation occurs.

### C004 - Execute approved next PR merge

Status: done  
Risk: high

Run only the exact approved merge command for the selected PR if the user later provides exact approval.

Acceptance:

- Only the exact approved PR is merged.
- Local evidence records approval, command, result, and remaining merge boundary.
- No additional remote mutation occurs.

### C005 - Complete remaining PR merge governance audit handoff

Status: done  
Risk: medium

Record final M129 audit state and the next safe governance boundary.

Acceptance:

- M129 final audit explains whether merge remains blocked, deferred, or completed.
- Remaining open PRs are explicitly handed off to follow-up governance.
- No unauthorized operation is recorded.

## Deferred

- Later remaining PR merge governance after one approved M129 merge.
- PR #6 revert governance.
- Shared-stack split or branch-surgery execution if PR #7 review rejects the shared-stack path.
