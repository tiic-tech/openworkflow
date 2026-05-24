# M129 C004 Merge Evidence: PR #4

Captured: 2026-05-25T00:20:50+08:00

## Approved Operation

User approval:

```text
Approve M129 C004 merge PR #4: run gh pr merge 4 --repo tiic-tech/openworkflow --merge --match-head-commit bd2780b1d5b117b2734e5b732164e5d299bd521a
```

Executed command:

```bash
gh pr merge 4 --repo tiic-tech/openworkflow --merge --match-head-commit bd2780b1d5b117b2734e5b732164e5d299bd521a
```

Command result: exited `0`.

## Pre-Merge Check

- PR: #4
- State: `OPEN`
- Draft: `false`
- Mergeable: `MERGEABLE`
- Head ref: `codex/m102-selected-change-commit-gate`
- Head OID: `bd2780b1d5b117b2734e5b732164e5d299bd521a`
- Remote head ref matched expected OID: yes
- Remote main before merge: `8656ed135c7a57c5b515572fa06bc082aabdcb95`
- Status check rollup: empty

## Merge Result

- PR state: `MERGED`
- Merged at: `2026-05-24T16:20:31Z`
- Merge commit: `b77418e2fe9b1f6eda213e52f495364bb1861e94`
- Remote main after merge: `b77418e2fe9b1f6eda213e52f495364bb1861e94`
- Local `origin/main` after fetch: `b77418e2fe9b1f6eda213e52f495364bb1861e94`
- PR #4 head branch after merge still exists at: `bd2780b1d5b117b2734e5b732164e5d299bd521a`

## Remaining Open PRs

After PR #4 merged, the remaining open PRs are:

| PR | Branch | Head OID | Draft | Mergeable | Checks |
| --- | --- | --- | --- | --- | --- |
| #5 | `codex/m117-git-automation-remote-readiness` | `898f0152a4e3e026ee5dcc78d4ef585c722a37b7` | false | `UNKNOWN` | none reported |
| #7 | `codex/m101-build-proto-prompt-command-split` | `f8bf087211316506f48155859f3e18edbc7224e4` | false | `UNKNOWN` | none reported |

GitHub PR API still reports old base OID `d0e13f4bba3a847b763d2db3f771659aac3a4fe5` for remaining PRs at capture time, while actual remote `main` is now `b77418e2fe9b1f6eda213e52f495364bb1861e94`.

## Unauthorized Operations Not Performed

- No additional PR was merged.
- No push or force-push was run.
- No PR was edited, closed, retargeted, commented on, or review-requested.
- No Issue was mutated.
- No branch was checked out, rebased, reset, deleted, or otherwise surgically modified.
- No product source files were changed.

## Follow-Up Boundary

C005 should record the final M129 audit and hand off PR #5 and PR #7 to refreshed future governance. No further merge should be attempted without refreshing remaining PR readiness against `main` at `b77418e2fe9b1f6eda213e52f495364bb1861e94`.
