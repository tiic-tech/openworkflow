# M128 Ready PR Merge Governance

Source of truth: `CANDIDATE_CHANGES.yaml`.

M128 is the next git-governance candidate queue after M125, M126, and M127 moved PR #4, PR #6, and PR #7 out of draft, and M123 had already moved PR #5 out of draft. The queue owns merge governance for the current ready PR set only: PR #4, PR #5, PR #6, and PR #7.

M128 is complete. It merged exactly PR #6 and handed off PR #4, PR #5, and PR #7 to follow-up merge governance.

## Boundary

- Branch boundary: `codex/m128-ready-pr-merge-governance`
- Current branch exception: planning was created on `codex/m122-m71-historical-stack-publication`
- Next recommended queue: `M129-remaining-ready-pr-merge-governance`
- Remote/base: `origin` / `main`

In scope: read-only merge-readiness inventory, first merge target sequencing, exact approval packet, one approved merge if later authorized, and audit handoff.

Out of scope: merge during DTC, push, PR edits, retargeting, closing, review requests, Issue mutation, force-push, rebase, reset, branch deletion, split/surgery, and product source changes.

## Current Open Ready PRs

| PR | Branch | State | Draft | Mergeable | Notes |
| --- | --- | --- | --- | --- | --- |
| #4 | `codex/m102-selected-change-commit-gate` | OPEN | false | MERGEABLE | Earlier M102 pilot PR |
| #5 | `codex/m117-git-automation-remote-readiness` | OPEN | false | MERGEABLE | M120 publication order ranked M117 before M71/shared group |
| #6 | `codex/m71-git-version-governance` | MERGED | false | n/a | Merged at `8656ed135c7a57c5b515572fa06bc082aabdcb95` |
| #7 | `codex/m101-build-proto-prompt-command-split` | OPEN | false | MERGEABLE | Shared M101-derived stack |

## Candidates

### C001 - Refresh ready PR merge-readiness inventory

Status: done  
Risk: medium

Refresh current read-only PR, branch, base, mergeability, review, check, and conflict facts for PR #4, #5, #6, and #7.

Completion evidence: `C001-refresh-ready-pr-merge-readiness-inventory/MERGE_READINESS_INVENTORY.md`

Result: all four target PRs are open, non-draft, mergeable, have matching remote head refs, have `origin/main` as an ancestor, and returned clean merge-tree probes. C002 can choose a first merge target.

Acceptance:

- Current merge-readiness facts are recorded for all four open ready PRs.
- The packet states whether C002 can choose a first merge target.
- No remote mutation or destructive git operation occurs.

### C002 - Decide first merge target and stop gates

Status: done  
Risk: medium

Use C001 evidence to recommend exactly one first merge target or stop with blockers. This candidate must decide whether first merge should follow repaired publication order or older PR creation order.

Completion evidence: `C002-decide-first-merge-target-and-stop-gates/FIRST_MERGE_TARGET_DECISION.md`

Result: PR #6 is recommended as the first merge target. Its head is the 66-commit common ancestor of PR #4, PR #5, and PR #7, which makes it the lowest-blast-radius merge boundary before refreshing the larger dependent stacks.

Required approval before C003 selection:

```text
Approve M128 C003 decision packet: prepare PR #6 merge high-risk decision packet; do not run gh pr merge, push, edit PRs, mutate Issues, or perform branch surgery.
```

Acceptance:

- Exactly one first merge target is recommended, or blockers are recorded.
- Deferred PRs remain open and untouched.
- The decision packet does not approve merge execution.

### C003 - Prepare exact merge approval packet for first target

Status: done  
Risk: high

Prepare the high-risk merge decision report for only the C002-selected PR.

Completion evidence: `HIGH_RISK_DECISION_REPORT.md`

Result: C003 refreshed PR #6, confirmed it is still open, non-draft, mergeable, and at head `a0ddcf94b0f856a92218ef07fd323d3eb5bae0a1`, then prepared the high-risk decision packet without running `gh pr merge`.

Required approval before C004 execution:

```text
Approve M128 C004 merge PR #6: run gh pr merge 6 --repo tiic-tech/openworkflow --merge --match-head-commit a0ddcf94b0f856a92218ef07fd323d3eb5bae0a1
```

Acceptance:

- `HIGH_RISK_DECISION_REPORT.md` names the selected PR and exact merge command.
- The report records required exact user approval text.
- No merge or other remote mutation occurs.

### C004 - Execute approved first PR merge

Status: done  
Risk: high

Run only the exact approved merge command for the selected PR if the user later provides the exact approval.

Completion evidence: `C004-approved-pr6-merge/MERGE_EVIDENCE.md`

Result: PR #6 was merged with the exact approved command. Merge commit: `8656ed135c7a57c5b515572fa06bc082aabdcb95`. The PR #6 head branch remains present because the command did not include `--delete-branch`.

Acceptance:

- Only the exact approved PR is merged.
- Local evidence records approval, command, result, and remaining merge boundary.
- No additional remote mutation occurs.

### C005 - Complete merge governance audit handoff

Status: done  
Risk: medium

Record final M128 audit state and the next safe governance boundary.

Completion evidence: `C005-merge-governance-audit-handoff/M128_MERGE_GOVERNANCE_AUDIT.md`

Result: M128 is complete. PR #6 is merged at `8656ed135c7a57c5b515572fa06bc082aabdcb95`; PR #4, PR #5, and PR #7 remain open and require refreshed governance against the new `main`.

Acceptance:

- M128 final audit explains whether merge remains blocked, deferred, or completed.
- Remaining ready PRs are explicitly handed off to follow-up governance.
- No unauthorized operation is recorded.

## Deferred

- Subsequent PR merge governance after one approved merge changes base OIDs and mergeability for the remaining PRs.
- Shared-stack split or branch-surgery execution remains separate if PR #7 review rejects the shared-stack path.
