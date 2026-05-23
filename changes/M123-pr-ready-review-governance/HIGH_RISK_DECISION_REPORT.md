# M123 High-Risk Decision Report: Draft PR Ready For Review

## Trigger

M121 completed M117 remote publication and left PR #5 open as a draft. PR #4
from the earlier M102 pilot is also open as a draft. Marking either PR ready for
review is a GitHub PR mutation under `references/gh-operation-governance.md`.

This report is evidence, not approval.

## Current Draft PRs

### PR #5

- URL: `https://github.com/tiic-tech/openworkflow/pull/5`
- Title: `M117: Git automation remote readiness governance`
- State: `OPEN`
- Draft: `true`
- Head: `codex/m117-git-automation-remote-readiness`
- Head OID: `898f0152a4e3e026ee5dcc78d4ef585c722a37b7`
- Base: `main`
- Base OID: `d0e13f4bba3a847b763d2db3f771659aac3a4fe5`
- Mergeability signal: `MERGEABLE`
- Review decision: empty
- Status check rollup: empty

### PR #4

- URL: `https://github.com/tiic-tech/openworkflow/pull/4`
- Title: `OpenWorkflow M102-selected-change-commit-gate`
- State: `OPEN`
- Draft: `true`
- Head: `codex/m102-selected-change-commit-gate`
- Head OID: `bd2780b1d5b117b2734e5b732164e5d299bd521a`
- Base: `main`
- Base OID: `d0e13f4bba3a847b763d2db3f771659aac3a4fe5`
- Mergeability signal: `MERGEABLE`
- Review decision: empty
- Status check rollup: empty

## High-Risk Boundary

Ready-for-review is a PR state mutation. The future commands are separate
approval gates:

```bash
gh pr ready 5 --repo tiic-tech/openworkflow
```

```bash
gh pr ready 4 --repo tiic-tech/openworkflow
```

Neither command is approved by this report.

## Concrete Risks

- Ready-for-review notifies collaborators and changes review expectations.
- PR #5 is a historical review branch for M117 and remains 263 commits ahead of
  `main` per M121 audit.
- PR #4 predates the M117 publication flow and should not be bundled with PR #5
  without a fresh readiness decision.
- Empty status check rollups mean there is no current CI evidence attached to
  either PR in the queried metadata.
- Ready-for-review does not imply merge approval.
- Closing, editing, merging, or rebasing PRs would be separate remote or
  destructive operations and are out of scope.

## Decision Options

### Defer

Keep both PRs as drafts. Use this if review scope, CI expectations, or reviewer
readiness is unclear.

### Preflight First

Run a read-only readiness preflight for PR #5 and PR #4, refresh branch heads,
mergeability, status checks, and review state, then return for exact approval.

### PR #5 Ready First

After read-only preflight and exact approval, mark only PR #5 ready for review:

```bash
gh pr ready 5 --repo tiic-tech/openworkflow
```

PR #4 remains draft.

### PR #4 Ready First

After read-only preflight and exact approval, mark only PR #4 ready for review:

```bash
gh pr ready 4 --repo tiic-tech/openworkflow
```

PR #5 remains draft.

## Recommended Path

Recommended option: preflight first, then consider PR #5 ready-for-review before
PR #4.

Reasoning:

- PR #5 is the direct output of the just-completed M121 publication path.
- M121 already recorded PR #5 publication audit and stop gates.
- PR #4 should remain separate unless fresh preflight shows it is still aligned
  with the current review strategy.

## Prepared PR #5 Approval Packet

C001 completed the read-only preflight. C002 prepared the exact PR #5
ready-for-review decision packet:

- `changes/M123-pr-ready-review-governance/C001-draft-pr-readiness-preflight/READINESS_PREFLIGHT.md`
- `changes/M123-pr-ready-review-governance/C002-pr5-ready-review-decision/PR5_READY_REVIEW_DECISION.md`

The only prepared command is:

```bash
gh pr ready 5 --repo tiic-tech/openworkflow
```

This packet is still evidence, not approval. C003 must stop unless the user
approves the exact command above.

## Executed PR #5 Transition

The user approved the exact C003 command:

```text
Approve M123 C003 ready using: gh pr ready 5 --repo tiic-tech/openworkflow
```

C003 executed:

```bash
gh pr ready 5 --repo tiic-tech/openworkflow
```

Audit evidence:

- `changes/M123-pr-ready-review-governance/C003-pr5-ready-review-transition/PR5_READY_REVIEW_AUDIT.md`

Result: PR #5 is open and no longer draft. This does not approve merge and does
not authorize any PR #4 transition.

## Guardrails

- Do not mark any PR ready for review without exact operation-level approval.
- Do not mark both PRs ready in one approval unless both exact commands are
  explicitly named.
- Do not merge, close, edit PR title/body, or change base/head refs.
- Do not mutate Issues, labels, milestones, or assignees.
- Do not push, force-push, delete branches, rebase, reset, or rewrite history.
- Do not publish M71 or shared M101-derived branches from M123.

## Go Criteria

Implementation may proceed only after the user explicitly approves one exact
command, for example:

- `Approve M123 C003 ready using: gh pr ready 5 --repo tiic-tech/openworkflow`
- `Approve M123 PR #4 ready using: gh pr ready 4 --repo tiic-tech/openworkflow`

Generic approval such as "continue" is not enough to change PR state.

## Stop Criteria

Stop even after approval if:

- The target PR is no longer open.
- The target PR is no longer draft.
- The head or base refs differ from the latest local readiness evidence.
- Mergeability becomes conflicting or unknown without explicit acceptance.
- Required readiness evidence is stale or missing.
- The requested operation would mutate any PR other than the exact approved PR.
- The operation would merge, close, edit, rebase, force-push, delete a branch, or
  mutate Issues.

## Validation Expectations

Before any ready-for-review transition:

```bash
git status --short --branch
gh pr view <number> --repo tiic-tech/openworkflow --json number,url,state,isDraft,title,headRefName,baseRefName,headRefOid,baseRefOid,mergeable,reviewDecision,statusCheckRollup
git ls-remote --heads origin <head-ref>
git diff --check
```

After any approved ready-for-review transition, record local audit evidence with
the approval source, exact command, previous PR state, resulting PR state, PR
URL, timestamp, and rollback guidance.

Rollback preference: keep the PR open and use follow-up review comments or
commits. Closing the PR or converting it back to draft requires a separate
high-risk report and exact approval.
