# G012 - Local Feat Branch Automation

## Goal

Implement the approved local-only primitive that creates or checks out the
branch recorded by a candidate queue's `queue_policy.branch_boundary`.

## Read First

- `changes/M71-git-version-control-governance/HIGH_RISK_DECISION_REPORT.md`
- `changes/M71-git-version-control-governance/G011-local-git-automation-contract/SELECTED_CHANGE.yaml`
- `references/git-version-control-governance.md`

## Do

- Validate the branch boundary supplied by the caller.
- Refuse dirty working trees before any local branch mutation.
- Support dry-run previews for local create and checkout actions.
- Execute only `git switch <branch>` or `git switch -c <branch>` when not in
  dry-run mode.
- Cover create, checkout-preview, and dirty-tree refusal paths in runtime
  verification.

## Do Not

- Do not push branches.
- Do not create remote PRs.
- Do not edit GitHub Issues.
- Do not reset, rebase, merge, delete branches, stash, restore, or clean.
- Do not add a public command surface; G015 owns that high-risk boundary.

## Owned Paths

- `packages/core/src/git/localGitAutomation.ts`
- `packages/cli/src/dev/verifyRuntimeSurface.ts`
- `changes/M71-git-version-control-governance/G012-local-feat-branch-automation/LOCAL_BRANCH_AUTOMATION_EVIDENCE.yaml`
- `changes/M71-git-version-control-governance/G012-local-feat-branch-automation/`

## Validation

- `npm run validate`
- `git diff --check`
- `npm run verify:runtime-surface`

## Stop Conditions

- Stop if branch automation needs remote state or authenticated GitHub access.
- Stop if implementation needs destructive git operations.
- Stop if command-surface changes are required before G015 approval.
