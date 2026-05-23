# Remote Publication Plan

Captured: 2026-05-23

Remote: `origin` -> `https://github.com/tiic-tech/openworkflow.git`

GitHub CLI auth: authenticated as `tiic-tech`

Remote mutation: not performed.

## Approval Boundary

This document is not approval to push or create PRs. Every `git push`, `gh pr create`, `gh pr edit`, merge, Issue mutation, rebase, reset, force-push, or branch deletion requires a later explicit operation-level approval in M119.

## Current Global Blockers

- Working tree is dirty with local PR summaries and M118 planning artifacts.
- Current branch is `codex/m118-repo-branch-pr-governance`, which does not match M102 or M117 branch boundaries.
- Remote branches for `codex/m102-selected-change-commit-gate` and `codex/m117-git-automation-remote-readiness` are absent or unreadable.
- Remote-plan reported `remote base head is unknown for origin/main`.
- Simulator evidence is missing for both M102 and M117 remote-plan probes.

## Ordered Publication Candidates

### 1. M102 Selected-Change Commit Gate

- Branch: `codex/m102-selected-change-commit-gate`
- Target base for stacked review: `codex/m100-dailin-grade-image-prompt-paragraphs`
- Target base for remote integration after repair: `main`
- Local summary: `changes/M102-selected-change-commit-gate/PR_READY_SUMMARY.md`
- Remote-plan status: blocked read-only
- Blockers:
  - current branch mismatch
  - dirty working tree
  - remote base head unknown
  - simulator evidence missing
  - remote branch absent or unreadable

Approval-gated commands for M119, after blockers are resolved:

```bash
git switch codex/m102-selected-change-commit-gate
node dist/cli/src/index.js git-automation remote-plan --root . --queue changes/M102-selected-change-commit-gate/CANDIDATE_CHANGES.yaml --base origin/main --remote origin --target-base main --json
git push origin codex/m102-selected-change-commit-gate
gh pr create --draft --base main --head codex/m102-selected-change-commit-gate --title "M102 selected-change commit gate" --body-file changes/M102-selected-change-commit-gate/PR_READY_SUMMARY.md
```

### 2. M117 Git Automation Remote Readiness

- Branch: `codex/m117-git-automation-remote-readiness`
- Stacked base: `codex/m101-build-proto-prompt-command-split`
- Local summary: `changes/M117-git-automation-remote-readiness/PR_READY_SUMMARY.md`
- Remote-plan status: blocked read-only
- Blockers:
  - current branch mismatch
  - dirty working tree
  - remote base head unknown
  - simulator evidence missing
  - remote branch absent or unreadable

Approval-gated commands for M119, after blockers are resolved:

```bash
git switch codex/m117-git-automation-remote-readiness
node dist/cli/src/index.js git-automation remote-plan --root . --queue changes/M117-git-automation-remote-readiness/CANDIDATE_CHANGES.yaml --base origin/main --remote origin --target-base main --json
git push origin codex/m117-git-automation-remote-readiness
gh pr create --draft --base main --head codex/m117-git-automation-remote-readiness --title "M117 git automation remote readiness" --body-file changes/M117-git-automation-remote-readiness/PR_READY_SUMMARY.md
```

### 3. M105, M106, M115 M101 Stack

- Branch boundary: `codex/m101-build-proto-prompt-command-split`
- Local summaries:
  - `changes/M105-m104-direct-trust-gate-fixes/PR_READY_SUMMARY.md`
  - `changes/M106-agent-resume-cockpit/PR_READY_SUMMARY.md`
  - `changes/M115-internal-coder-quality-governance/PR_READY_SUMMARY.md`
- Publication mode: stacked group or later branch repair only.
- Do not publish as independent PRs until M101 stack disposition is approved.

### 4. M71 And Historical Stack

- M71 has a local summary, but queue status remains active.
- M73/M84-M97 and M98-M100 need status/evidence cleanup before publication.
- M113 must be repaired or excluded because its YAML is malformed.

## Rollback Guidance

- For a later branch push: record the previous remote ref and prefer revert PR recovery over force-push.
- For a later draft PR create: record the PR URL and close guidance.
- For a later draft PR update: record the previous managed-section digest and restore guidance.
- For merge or Issue mutation: no rollback is planned in M118 because those operations remain out of scope.

## Stop Conditions

Stop before remote mutation if any of these remain true:

- working tree is dirty with unrelated paths
- current branch does not match queue branch boundary
- remote-plan is not green
- simulator evidence is missing
- target base is ambiguous
- branch stack disposition has not been approved
- user has not approved the exact push or PR command
