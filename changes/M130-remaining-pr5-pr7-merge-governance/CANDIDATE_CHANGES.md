# M130 Remaining PR #5/#7 Merge Governance

Source of truth: `CANDIDATE_CHANGES.yaml`.

M130 starts after M129 merged PR #4 into `main` at `b77418e2fe9b1f6eda213e52f495364bb1861e94`. It owns the next refreshed merge-governance slice for PR #5 and PR #7.

C001 completed the read-only merge-readiness refresh. No merge or remote mutation is authorized.

## Boundary

- Branch boundary: `codex/m130-remaining-pr5-pr7-merge-governance`
- Current branch exception: planning was created on `codex/m122-m71-historical-stack-publication`
- Next recommended candidate: `C002`
- Priority: active resume target on `codex/m130-remaining-pr5-pr7-merge-governance`
- Remote/base: `origin` / `main`
- Current remote main: `b77418e2fe9b1f6eda213e52f495364bb1861e94`

In scope: read-only merge-readiness refresh against the new main, next target sequencing between PR #5 and PR #7, exact approval packet, one approved merge if later authorized, and audit handoff.

Out of scope: merge during DTC, push, PR edits, retargeting, closing, review requests, Issue mutation, force-push, rebase, reset, branch deletion, split/surgery, reverting PR #4 or PR #6, and product source changes.

## Remaining Open PRs

| PR | Branch | State | Draft | Mergeable | Note |
| --- | --- | --- | --- | --- | --- |
| #5 | `codex/m117-git-automation-remote-readiness` | OPEN | false | MERGEABLE | Needs refresh against new `main` |
| #7 | `codex/m101-build-proto-prompt-command-split` | OPEN | false | MERGEABLE | Needs refresh against new `main`; prior M129 evidence showed #7 ancestor of #5 |

GitHub PR metadata currently reports the older base OID for these PRs. C001 must refresh against the actual remote `main` head before any target choice.

## Candidates

### C001 - Refresh PR #5/#7 merge-readiness against new main

Status: done
Risk: medium

Selected change artifacts:

- `C001-refresh-pr5-pr7-merge-readiness/SELECTED_CHANGE.yaml`
- `C001-refresh-pr5-pr7-merge-readiness/ATOM_TASKS.yaml`
- `C001-refresh-pr5-pr7-merge-readiness/IMPLEMENTATION_BRIEF.md`
- `C001-refresh-pr5-pr7-merge-readiness/MERGE_READINESS_REFRESH.md`

Result:

- PR #5 and PR #7 remain open, non-draft, and MERGEABLE.
- Both PR metadata records still report the older base OID.
- Local merge-tree checks against current `origin/main` produced clean tree OIDs for both PRs.
- PR #7 remains an ancestor of PR #5.

Refresh current read-only PR, branch, base, mergeability, review, check, ancestry, and merge-tree facts for PR #5 and PR #7 after PR #4 changed `main`.

Acceptance:

- Current merge-readiness facts are recorded for PR #5 and PR #7.
- The packet states whether C002 can choose a next merge target.
- No remote mutation or destructive git operation occurs.

### C002 - Decide next PR #5/#7 merge target and stop gates

Status: ready
Risk: medium

Use C001 evidence to recommend exactly one next merge target or stop with blockers.

Acceptance:

- Exactly one next merge target is recommended, or blockers are recorded.
- Deferred PR remains open and untouched.
- The decision packet does not approve merge execution.

### C003 - Prepare exact merge approval packet for selected PR

Status: candidate
Risk: high

Prepare the high-risk merge decision report for only the C002-selected PR.

Acceptance:

- `HIGH_RISK_DECISION_REPORT.md` names the selected PR and exact merge command.
- The report records required exact user approval text.
- No merge or other remote mutation occurs.

### C004 - Execute approved selected PR merge

Status: candidate  
Risk: high

Run only the exact approved merge command for the selected PR if the user later provides exact approval.

Acceptance:

- Only the exact approved PR is merged.
- Local evidence records approval, command, result, and remaining merge boundary.
- No additional remote mutation occurs.

### C005 - Complete PR #5/#7 merge governance audit handoff

Status: candidate  
Risk: medium

Record final M130 audit state and the next safe governance boundary.

Acceptance:

- M130 final audit explains whether merge remains blocked, deferred, or completed.
- Remaining open PRs are explicitly handed off to follow-up governance.
- No unauthorized operation is recorded.

## Deferred

- Later remaining PR merge governance after one approved M130 merge.
- PR #4 or PR #6 revert governance.
- Shared-stack split or branch-surgery execution if PR #7 review rejects the shared-stack path.
