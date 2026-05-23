# M119 Approved Remote PR Publication

Source of truth: `CANDIDATE_CHANGES.yaml`.

## Boundary

M119 owns remote publication governance for the first reviewable OpenWorkflow feat branches after M118. It starts with a read-only preflight and does not approve or perform remote mutation during queue creation.

Branch boundary: `codex/m119-approved-remote-pr-publication`

Current branch after selection setup: `codex/m119-approved-remote-pr-publication`

## Selection Policy

Select C001 first. Push and draft PR candidates are high risk and require a green C001 preflight, a high-risk decision report for the exact operation boundary, and explicit user approval for the concrete command.

Completed candidate: C003

High-risk report: `changes/M119-approved-remote-pr-publication/HIGH_RISK_DECISION_REPORT.md`

## Candidates

### C001 - Refresh remote publication preflight and choose the first pilot

Status: done

Risk: medium

Purpose: convert the M118 remote publication plan into a current preflight packet that names one first pilot branch or explains why no branch is ready.

Includes: working tree and branch verification, remote visibility, gh authentication, git-automation remote-plan reruns, blocker capture, and exact approval text.

Excludes: push, PR creation or edit, Issue mutation, branch pointer movement, and history rewrite.

Unlocks: C002, C003, C004

Selection artifacts:

- `changes/M119-approved-remote-pr-publication/C001-refresh-remote-publication-preflight/SELECTED_CHANGE.yaml`
- `changes/M119-approved-remote-pr-publication/C001-refresh-remote-publication-preflight/ATOM_TASKS.yaml`
- `changes/M119-approved-remote-pr-publication/C001-refresh-remote-publication-preflight/IMPLEMENTATION_BRIEF.md`

Completion evidence:

- `changes/M119-approved-remote-pr-publication/C001-refresh-remote-publication-preflight/REMOTE_PUBLICATION_PREFLIGHT.md`

Result: no branch is ready for immediate push from the current dirty M119 planning state. Commit the M119 evidence, then rerun remote-plan from a clean tree before considering C002.

### C002 - Execute an explicitly approved pilot branch push

Status: done

Risk: high

Purpose: after C001 is green and the user approves the exact command, push one pilot branch to origin and record local audit evidence.

Approval required: satisfied for one exact push command

Pushed pilot: `codex/m102-selected-change-commit-gate`

Approved and executed command:

```bash
git push origin codex/m102-selected-change-commit-gate
```

Pushed commit: `bd2780b1d5b117b2734e5b732164e5d299bd521a`

Remote ref: `refs/heads/codex/m102-selected-change-commit-gate`

Audit evidence:

- `changes/M119-approved-remote-pr-publication/C002-execute-approved-pilot-branch-push/REMOTE_PUSH_AUDIT.md`

Excludes: draft PR creation, multi-branch push, force-push, rebase, reset, cherry-pick, branch deletion, Issue mutation, and PR edits.

Unlocks: C003, C004

### C003 - Create an explicitly approved draft PR for the pushed pilot branch

Status: done

Risk: high

Purpose: after C002 and exact user approval, create one draft PR using the matching local `PR_READY_SUMMARY.md` as the body.

Approval required: satisfied for one exact draft PR command

Approved and executed command:

```bash
gh pr create --draft --repo tiic-tech/openworkflow --base main --head codex/m102-selected-change-commit-gate --title "OpenWorkflow M102-selected-change-commit-gate" --body-file changes/M102-selected-change-commit-gate/PR_READY_SUMMARY.md
```

PR URL: `https://github.com/tiic-tech/openworkflow/pull/4`

PR state: `OPEN`, draft `true`

Body source: `changes/M102-selected-change-commit-gate/PR_READY_SUMMARY.md`

Audit evidence:

- `changes/M119-approved-remote-pr-publication/C003-create-approved-draft-pr/DRAFT_PR_AUDIT.md`

Excludes: marking ready for review, editing unrelated PRs, merging, closing PRs, and Issue or label mutation.

Unlocks: C004

### C004 - Record post-publication audit and next publication recommendation

Status: candidate

Risk: medium

Purpose: summarize the completed pilot, refresh local evidence, and recommend either another publication pilot or M120 branch repair.

Excludes: additional push, additional PR creation, merge, release, and historical branch repair.

## Deferred

M120 historical branch repair remains separate. Splitting old stacked branches may require cherry-pick, rebase, reset, or branch pointer changes and needs its own high-risk queue.
