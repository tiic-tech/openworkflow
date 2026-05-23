# High-Risk Decision Report - M117 Git Automation Remote Readiness

## Trigger

M117 C001 and C002 are complete. The next M117 candidates are high-risk because
they affect future remote PR and merge readiness:

- `C003` hardens draft PR pilot approval and local audit evidence.
- `C004` defines structured merge-conflict readiness checkpoints.

This report is a decision artifact for discussion. It is not approval to push,
create or edit a remote PR, mutate Issues, merge, rebase, reset, force-push, or
run destructive git operations.

## Current State

M117 has already established the local prerequisites:

- C001: `git-automation` reports now consume modern
  `LOCAL_COMMIT_EVIDENCE.yaml` records.
- C002: branch, remote-plan, simulate, and draft-pr now report and enforce
  feat-scoped branch identity.

The remaining risk is not whether the Agent can read local evidence or identify
the owning branch. The remaining risk is whether future remote-impacting
automation can be prepared without accidentally becoming remote mutation.

## High-Risk Surface

### C003 Draft PR Pilot Approval And Audit

C003 touches the draft PR pilot, which is close to authenticated GitHub
mutation. Even if the implementation is only a gate, a weak design could make
`--write --allow-draft-pr` look like enough approval for creating or editing a
remote draft PR.

Concrete risks:

- A preview-only path could drift into real `gh pr create` or `gh pr edit`.
- A CLI flag could be mistaken for operation-level user approval.
- Local OW artifacts could fail to record target PR, branch, base, body digest,
  approval source, timestamp, and rollback guidance.
- A future Agent could treat a draft PR update as low risk because the PR stays
  in draft state.

### C004 Merge-Conflict Readiness Checkpoint

C004 touches future merge readiness. Even a read-only conflict checkpoint can
shape later autonomous merge behavior, so it must not imply permission to merge,
rebase, reset, force-push, or auto-resolve conflicts.

Concrete risks:

- A conflict probe could run against the user's working tree instead of an
  isolated temporary repo or worktree.
- A clean probe could be misread as permission to merge.
- Conflict files and required validation evidence could be incomplete.
- Future automation could skip human review or repository protection checks.

## Decision Options

### Option A - Stop After C002

Do not select C003 or C004. Leave M117 with local evidence and branch identity
readiness only.

Impact: safest short-term path, but remote-readiness remains incomplete and
future Agents still lack structured PR approval and conflict checkpoint
contracts.

### Option B - Approve C003 Only As Gate Hardening

Select and implement C003 with these limits:

- Add a hard local approval-evidence requirement for write-mode draft PR pilot.
- Keep preview mode read-only.
- Record local audit fields for any future approved write path.
- Do not run real `gh pr create` or `gh pr edit` in this candidate.
- Do not enable push, ready-for-review PR mutation, merge, or Issue mutation.

Impact: closes the most immediate PR mutation footgun while postponing merge
conflict structure.

### Option C - Approve C004 Only As Read-Only Merge Readiness

Select and implement C004 with these limits:

- Add structured conflict checkpoint fields to remote-plan and simulator.
- Use temporary local repositories or isolated probes only.
- Record conflict files, merge base, branch/base heads, required validations,
  and stop reasons.
- Do not merge, rebase, reset, force-push, auto-resolve conflicts, or mutate a
  PR.

Impact: gives future automation a safer merge-readiness contract, but leaves
draft PR write approval weak.

### Option D - Approve C003 Then C004 As Local/Read-Only Hardening

Select and implement C003 first, then C004, with all Option B and Option C
limits. This keeps M117 as a remote-readiness queue, not a remote-mutation
queue.

Impact: strongest path for M117. It prepares the future full automation order
without granting permission to push, create/edit PRs, merge, or mutate Issues.

### Option E - Approve Actual Remote Draft PR Mutation

Approve a concrete draft PR create or edit operation for a specific remote,
branch, base, title, and body source.

Impact: out of scope for M117 by default. This requires operation-level user
approval with an exact target and rollback guidance. It should not be bundled
with C003/C004 implementation unless the user explicitly names the remote
operation.

## Recommended Decision

Recommend **Option D: approve C003 then C004 as local/read-only hardening only**.

Reason:

- C001 and C002 already made evidence and branch identity machine-readable.
- C003 should close the existing draft PR write-mode approval gap before any
  later PR automation relies on it.
- C004 should make merge-conflict readiness structured before any later
  autonomous merge queue exists.
- Both can be implemented without executing remote mutation.

## Pending Decision

Status: `pending_user_decision`

The user should approve exactly one option before C003 or C004 is selected:

- `Approve Option A`
- `Approve Option B`
- `Approve Option C`
- `Approve Option D`
- `Approve Option E` with exact remote, branch, base, PR operation, payload
  source, and rollback guardrails

Ambiguous instructions such as "continue" are not enough to approve C003, C004,
or any remote-impacting operation.

## Guardrails If Option B, C, Or D Is Approved

- No `git push`.
- No `gh pr create`, `gh pr edit`, `gh pr merge`, or ready-for-review mutation.
- No Issue creation, edit, closure, label mutation, or milestone mutation.
- No `git merge`, `git rebase`, `git reset`, force-push, or branch deletion.
- No conflict resolution in the user's working tree.
- Preview and report paths must remain useful without write approval.
- Any future write-mode remote operation must require a local approval artifact
  or an explicit operation-level user approval naming the exact target.
- Local audit evidence must include operation kind, target remote/PR when
  applicable, branch, base, body digest or conflict checkpoint digest, approval
  source, timestamp, result, and rollback guidance.
- C003 and C004 must complete through local commit evidence before C005 can be
  selected.

## Stop Criteria

Stop if:

- implementation scope expands into push, PR mutation, Issue mutation, merge,
  rebase, reset, force-push, or auto conflict resolution;
- the proposed approval source is only a boolean flag without a local or
  operation-level approval record;
- conflict probing would modify the user's working tree;
- generated `.agents/**` or `.openworkflow/**` files would need hand edits as
  the durable fix;
- validation would require migrating historical queues outside M117.

## Validation Expectations

For C003:

- `npm run build`
- targeted draft-pr approval/evidence fixture
- `npm run verify:runtime-surface`
- `git diff --check`

For C004:

- `npm run build`
- targeted merge-conflict checkpoint fixture
- `npm run verify:runtime-surface`
- `git diff --check`

For either candidate:

- `node dist/cli/src/index.js validate --root . --json`
- `node dist/cli/src/index.js summaries --root . --strict --json`
- `node dist/cli/src/index.js resume --root . --json`
