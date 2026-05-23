# M119 High-Risk Decision Report

## Trigger

M119 C001 completed the read-only remote publication preflight. After fixing the local Git proxy to
`127.0.0.1:10808`, M102 became the preferred pilot branch for remote publication, but C002 would
push an authenticated branch to GitHub and therefore crosses the high-risk remote mutation boundary.

## Change

- Candidate: `C002`
- Title: Execute an explicitly approved pilot branch push
- Status: candidate
- Proposed first pilot branch: `codex/m102-selected-change-commit-gate`
- Target remote: `origin`
- Target base: `main`

C002 is high risk because `git push origin codex/m102-selected-change-commit-gate` mutates
`https://github.com/tiic-tech/openworkflow.git`.

## Concrete Risks

- Publishing the wrong branch could expose an unintended historical stack.
- A pushed branch may become a collaboration boundary before the PR body and review context are
  fully aligned.
- The current remote-plan implementation still reports `simulator evidence is missing` for M102
  because it only treats a completed queue candidate with id `G017` or a title containing
  `simulator` as simulator evidence.
- The target remote branch is absent today, so rollback planning must assume this is a first push.
- Draft PR creation is a separate remote mutation and must not be bundled into the branch push.

## Decision Options

### Defer

Do not push. Keep M102 local until the simulator-evidence gate is improved or M120 branch repair is
complete.

### Design-Only

Record the exact push plan and approval text, but do not run `git push`.

### Narrow Pilot

Approve one branch push only:

```bash
git switch codex/m102-selected-change-commit-gate
git push origin codex/m102-selected-change-commit-gate
```

This option does not approve draft PR creation.

### Full Pilot

Approve the branch push and, after the push succeeds, separately approve one draft PR creation using
`changes/M102-selected-change-commit-gate/PR_READY_SUMMARY.md` as the body.

## Recommended Path

Use the narrow pilot only after explicit user approval of the exact push command.

Reasoning:

- M102 is on its branch boundary.
- The working tree was clean after the local PR-ready summary commit.
- `origin/main` is readable after the proxy fix.
- The read-only merge checkpoint is fast-forward and reports no conflict files.
- The simulator command itself returned ok:true with no blockers when run as:

```bash
node dist/cli/src/index.js git-automation simulate --root . --queue changes/M102-selected-change-commit-gate/CANDIDATE_CHANGES.yaml --base main --json
```

## Guardrails

- Push only `codex/m102-selected-change-commit-gate`.
- Do not force-push.
- Do not create, edit, close, mark ready, or merge a PR in C002.
- Do not mutate Issues, labels, milestones, or assignments.
- Record the pushed remote ref and local HEAD after the push.
- If the push fails, stop and record the failure; do not repair with rebase, reset, or force-push.

## Go Criteria

The user must explicitly approve the exact push command:

```bash
git push origin codex/m102-selected-change-commit-gate
```

General instructions such as "continue" are not enough to approve this operation.

## Stop Criteria

- Working tree is dirty.
- Current branch is not `codex/m102-selected-change-commit-gate`.
- The push target differs from `origin codex/m102-selected-change-commit-gate`.
- Remote-plan reports a blocker other than the known simulator-evidence binding gap.
- `git ls-remote --heads origin main` cannot read `origin/main`.
- The user has not approved the exact push command.

## Validation Expectations

Before any approved push:

```bash
git status --short --branch
git ls-remote --heads origin main codex/m102-selected-change-commit-gate
node dist/cli/src/index.js git-automation simulate --root . --queue changes/M102-selected-change-commit-gate/CANDIDATE_CHANGES.yaml --base main --json
node dist/cli/src/index.js git-automation remote-plan --root . --queue changes/M102-selected-change-commit-gate/CANDIDATE_CHANGES.yaml --base origin/main --remote origin --target-base main --json
```

After any approved push:

```bash
git ls-remote --heads origin codex/m102-selected-change-commit-gate
```

## Outcome

C002 narrow pilot was approved and executed on 2026-05-23.

- Executed command: `git push origin codex/m102-selected-change-commit-gate`
- Pushed commit: `bd2780b1d5b117b2734e5b732164e5d299bd521a`
- Verified remote ref: `refs/heads/codex/m102-selected-change-commit-gate`
- Audit evidence: `changes/M119-approved-remote-pr-publication/C002-execute-approved-pilot-branch-push/REMOTE_PUSH_AUDIT.md`

This outcome does not approve or perform draft PR creation.
