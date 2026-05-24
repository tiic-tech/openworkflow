# High-Risk Decision Report - G018 Narrow Autonomous Remote Pilot

## Trigger

G018 is the next candidate after the read-only autonomous simulator. The user
approved the staged **B -> C** path:

- B: remote read-only plus PR-ready remote plan
- C: narrow draft PR remote mutation pilot

## Change

Candidate: `G018`

Title: Plan narrow autonomous remote pilot

Status: `selected`

This is high risk because it chooses the first path from read-only autonomous
planning toward remote mutation. G018 itself is planning-only; it does not
push, create PRs, edit PRs, merge PRs, or mutate Issues.

## Concrete Risks

- Remote read APIs can still target the wrong repository, remote, base branch,
  or PR if identity checks are weak.
- A stale remote plan could become dangerous if reused after new local commits
  or remote branch changes.
- Draft PR creation can expose incomplete work if payload and branch checks are
  not strict.
- Draft PR update can overwrite human edits if body digest or managed-section
  boundaries are not tracked.
- A broad pilot could accidentally include push, ready PR transition, merge, or
  Issue mutation.

## Decision Options

### Option A - Stop At Simulator

Do not add any remote read or mutation capability after G017.

Impact: safest, but it prevents OW from proving remote handoff behavior.

### Option B - Remote Read-Only Plus PR-Ready Remote Plan

Read remote refs and PR metadata, compare them to local queue evidence, and
write a local operation plan. No push, PR creation, PR update, merge, or Issue
mutation.

Impact: validates target identity and stale-state handling with low blast
radius.

### Option C - Narrow Draft PR Remote Mutation Pilot

After Option B is validated, allow one remote mutation class: draft PR creation
or managed-section update, with explicit config, payload preview, evidence, and
rollback guidance.

Impact: moderate risk, reviewable and reversible compared with merge.

### Option D - Full Remote Lifecycle

Allow push, PR creation/update, ready transition, merge, and Issue mutation.

Impact: too broad for the current evidence model and not approved.

## Approved Decision

Proceed in two separate implementation stages.

Stage B becomes `G019`: implement remote read-only planning that can inspect
remote branch/base/PR state and produce an executable plan without mutation.

Stage C becomes `G020`: after G019 validates evidence quality, implement a
narrow draft PR pilot. The pilot may create or update a draft PR only when the
operation has explicit configuration, clean local state, simulator evidence,
ordered local commits, PR-ready summary evidence, and rollback guidance.

Implementation resumes only after explicit approval of this staged path. The
user approved B -> C on 2026-05-21.

## Required Evidence Before G019

- Clean working tree.
- Current branch matches `queue_policy.branch_boundary`.
- Queue contains done candidates with commit evidence where available.
- `PR_READY_SUMMARY.md` exists and identifies deferred or blocked candidates.
- Simulator output reports `mutation_performed: false`.
- Target remote and target base are explicit command inputs or config values.

## Required Evidence Before G020

- G019 remote read-only plan completed and is current with local HEAD.
- Ordered local commits from base to HEAD are present.
- Target remote, target branch, target base, and draft PR payload are explicit.
- PR body is generated from local evidence and includes a managed section.
- Rollback plan names how to close the draft PR or restore the previous body.
- Merge, Issue mutation, ready-for-review, and destructive git operations remain
  disabled.

## Recommended Path

Choose Option B first, then Option C.

Reason: B proves target identity, remote staleness detection, PR metadata
reading, and local evidence quality without mutation. C then limits the first
mutation to draft PR creation or managed-section update, which is reviewable
and recoverable without merge.

## Guardrails

- G019 must remain read-only and must not mutate local or remote git state.
- G020 must be disabled by default and require explicit local configuration.
- Draft PR mutation must include payload preview, managed body boundaries,
  before/after evidence, and rollback guidance.
- Every remote target must be explicit: repository, remote, branch, base, and
  PR id or creation target.
- Any stale local HEAD, changed remote ref, dirty tree, missing summary, or
  missing simulator evidence blocks mutation.

Denied operations:

- `git push --force` or force-with-lease.
- Reset, rebase, or destructive branch deletion.
- PR merge.
- Ready-for-review transition.
- Issue creation, edit, closure, labels, or comments.
- Any mutation outside the configured draft PR operation.

## Recommended Sequence

1. Implement `G019` remote read-only planning.
2. Validate G019 with `npm run validate`, `git diff --check`, and runtime
   surface coverage if command behavior changes.
3. Review G019 output against a real branch without mutation.
4. Implement `G020` as draft PR creation/update only.
5. Keep merge and Issue mutation as separate high-risk candidates.

## Go Criteria

G019 may proceed because the user explicitly approved the B -> C path and G019
is read-only. G020 may proceed only after G019 completes and the selected change
defines the exact draft PR operation, target identity checks, payload preview,
and rollback record.

Ambiguous instructions such as "continue" are not enough to expand beyond draft
PR mutation. Merge, Issue mutation, force-push, ready transition, and full
autonomous lifecycle each require a separate explicit high-risk approval.

## Stop Criteria

Stop and produce a new high-risk report if the implementation attempts to add:

- branch push before remote read-only planning is validated
- merge behavior
- Issue mutation
- force-push or history rewrite
- PR mutation without payload preview and rollback evidence

## Validation Expectations

G018 must run:

- `npm run validate`
- `git diff --check`

G019 and G020 must also run:

- `npm run verify:runtime-surface`
