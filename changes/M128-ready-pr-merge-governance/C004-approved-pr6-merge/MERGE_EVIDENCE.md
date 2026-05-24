# M128 C004 Approved PR #6 Merge Evidence

Captured at: 2026-05-24T17:32:18+08:00

## Approval

User approval:

```text
Approve M128 C004 merge PR #6: run gh pr merge 6 --repo tiic-tech/openworkflow --merge --match-head-commit a0ddcf94b0f856a92218ef07fd323d3eb5bae0a1
```

Approved command:

```bash
gh pr merge 6 --repo tiic-tech/openworkflow --merge --match-head-commit a0ddcf94b0f856a92218ef07fd323d3eb5bae0a1
```

Command result: exited with code 0.

## Pre-Merge Verification

Immediately before execution, PR #6 was verified with `gh pr view`:

- State: `OPEN`
- Draft: `false`
- Merged at: `null`
- Head ref: `codex/m71-git-version-governance`
- Head OID: `a0ddcf94b0f856a92218ef07fd323d3eb5bae0a1`
- Base ref: `main`
- Base OID: `d0e13f4bba3a847b763d2db3f771659aac3a4fe5`
- Mergeable: `MERGEABLE`
- Status check rollup: empty

## Post-Merge Result

PR #6 after the approved command:

- State: `MERGED`
- Draft: `false`
- Merged at: `2026-05-24T09:31:55Z`
- Merge commit: `8656ed135c7a57c5b515572fa06bc082aabdcb95`
- Head ref: `codex/m71-git-version-governance`
- Head OID: `a0ddcf94b0f856a92218ef07fd323d3eb5bae0a1`
- Base ref: `main`

Remote refs after merge:

- `refs/heads/main`: `8656ed135c7a57c5b515572fa06bc082aabdcb95`
- `refs/heads/codex/m71-git-version-governance`: `a0ddcf94b0f856a92218ef07fd323d3eb5bae0a1`

The approved command did not include `--delete-branch`; the PR #6 head branch remains present on origin.

## Remaining Open PRs

After PR #6 merged, the remaining open ready PRs are:

- PR #4: `codex/m102-selected-change-commit-gate`
- PR #5: `codex/m117-git-automation-remote-readiness`
- PR #7: `codex/m101-build-proto-prompt-command-split`

Their `mergeable` signals returned `UNKNOWN` immediately after `main` changed. They must be refreshed before any future merge decision packet or merge execution.

## Unauthorized Operations Not Performed

- No PR #4/#5/#7 merge.
- No push or force-push.
- No PR edit, close, retarget, comment, or review request.
- No Issue mutation.
- No branch checkout, branch deletion, rebase, reset, split/surgery, or destructive local git operation.
- No product source change.

## Follow-Up Boundary

C005 should complete M128 audit handoff. Any additional merge governance must refresh PR #4/#5/#7 against `origin/main` at `8656ed135c7a57c5b515572fa06bc082aabdcb95` before preparing another high-risk decision packet.
