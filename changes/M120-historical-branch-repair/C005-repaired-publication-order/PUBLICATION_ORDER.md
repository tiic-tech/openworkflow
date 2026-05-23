# M120 Repaired Publication Order

## Summary

M120 repaired the immediate branch-local evidence blocker for M117 and did not identify a current
need for destructive or history-rewriting branch surgery. C004 is therefore deferred until a concrete
history surgery need appears.

No push, PR creation, PR edit, ready-for-review transition, merge, Issue mutation, rebase, reset,
cherry-pick, force-push, branch deletion, or branch pointer move is approved by this plan.

## Current Published State

- PR #4: `https://github.com/tiic-tech/openworkflow/pull/4`
- PR #4 state: `OPEN`
- PR #4 draft: `true`
- PR #4 base/head: `main <- codex/m102-selected-change-commit-gate`
- PR #4 remains draft until separately approved for ready-for-review.

## Candidate Ranking

### 1. M117-git-automation-remote-readiness

Recommendation: next publication queue.

Evidence:

- Branch boundary: `codex/m117-git-automation-remote-readiness`
- Branch-local `PR_READY_SUMMARY.md`: restored on M117 branch
- Repair commit: `898f0152a4e3e026ee5dcc78d4ef585c722a37b7`
- Existing remote branch: absent
- Existing PR: none
- Merge readiness: fast-forward, conflict probe clean
- Simulator: `ok:true`
- Remote-plan after repair: missing-summary blocker cleared
- Remaining remote-plan blocker: `simulator evidence is missing`

Interpretation:

M117 is the cleanest next publication candidate. The only remaining blocker is the known simulator
evidence binding gap in `remote-plan`; the simulator command itself is green. Publish M117 through a
new approval-gated queue, proposed as `M121-m117-remote-publication`.

Required before any remote mutation:

- Fresh high-risk decision report for the exact M117 push command.
- Exact user approval for `git push origin codex/m117-git-automation-remote-readiness`.
- Separate exact approval for any draft PR creation.

### 2. M71-git-version-control-governance

Recommendation: second publication candidate after M117 or after explicit historical-stack review.

Evidence:

- Branch boundary: `codex/m71-git-version-governance`
- Branch-local `PR_READY_SUMMARY.md`: present
- Existing remote branch: absent
- Existing PR: none
- Remote-plan: `ok:true`
- Simulator: `ok:true`
- Merge readiness: fast-forward, conflict probe clean
- Historical note: 66 commits ahead of `main`, with early governance work predating strict commit
  evidence.

Interpretation:

M71 is technically readable and remote-ready, but it is an older historical stack. Publish it only
after explicitly accepting it as one intentionally coupled review branch.

### 3. M101-derived Shared Branch Group

Plans:

- `M105-m104-direct-trust-gate-fixes`
- `M106-agent-resume-cockpit`
- `M115-internal-coder-quality-governance`

Recommendation: do not publish as separate PRs yet.

Evidence:

- Recorded branch boundary: `codex/m101-build-proto-prompt-command-split`
- Current PR-ready summaries are not present on that branch.
- Multiple queues share the same branch boundary.

Interpretation:

These queues need a later decision: accept one shared-stack review branch, or perform a high-risk
branch split plan. Any split involving cherry-pick, rebase, reset, or branch pointer changes must go
through C004-style high-risk reporting and exact approval.

## Deferred C004

C004 is deferred because M120's current path does not require history surgery. It should be restored
only if a concrete operation needs:

- rebase
- reset
- cherry-pick branch splitting
- destructive branch deletion
- force-push or remote branch deletion
- PR edit, close, ready-for-review transition, or merge

## Next Queue

Create `M121-m117-remote-publication` to handle M117 publication.

Suggested first candidate for M121:

- Refresh M117 remote publication preflight and high-risk decision report for the exact push command.

Suggested exact push command that remains unapproved:

```bash
git push origin codex/m117-git-automation-remote-readiness
```

This command is not approved by M120.

## Stop Gates

- Do not mark PR #4 ready without exact approval.
- Do not push M117 or M71 without exact approval.
- Do not create draft PRs for M117 or M71 without exact approval.
- Do not merge any PR from this plan.
- Do not mutate GitHub Issues, labels, milestones, or assignments from this plan.
