# M124 High-Risk Decision Report

Captured at: `2026-05-23T22:16:03+08:00`

## Scope

This report is local planning evidence for the shared M101-derived branch group:

- M105: `M105-m104-direct-trust-gate-fixes`
- M106: `M106-agent-resume-cockpit`
- M115: `M115-internal-coder-quality-governance`
- Target publication branch: `codex/m101-build-proto-prompt-command-split`
- Target base: `main`
- Target remote: `origin`

It is evidence, not approval. It does not authorize push, draft PR creation,
ready-for-review transition, branch surgery, PR mutation, Issue mutation, merge,
or any destructive git operation.

## Current Facts

- Target branch head: `f8bf087211316506f48155859f3e18edbc7224e4`
- `origin/main`: `d0e13f4bba3a847b763d2db3f771659aac3a4fe5`
- Merge base: `d0e13f4bba3a847b763d2db3f771659aac3a4fe5`
- Commits ahead of `origin/main`: `251`
- `origin/main` is an ancestor of the target branch: yes
- Conflict probe tree: `e70f5ae555b03b1ee3f1a3f32f94a0e8c94b55c9`
- Remote target branch: absent
- Existing PRs for the target branch: none
- M105, M106, and M115 all have local PR-ready summaries and all record the same
  branch boundary: `codex/m101-build-proto-prompt-command-split`

## Decision Options

### Option A - Shared-Stack Publication

Publish one intentionally shared historical review branch, then create one
draft PR that names M105, M106, and M115 as a coupled review stack.

Rationale:

- This avoids high-risk history surgery.
- The branch has a clean ancestry relationship to `origin/main`.
- The remote branch and PR do not already exist, so publication can be a
  narrow, auditable push followed by a separate draft PR gate.
- Existing PR-ready summaries already describe the source queues that share the
  branch boundary.

Risks:

- The PR will expose a 251-commit historical stack.
- Reviewers may find one combined PR too broad.
- The PR body must be explicit that the branch intentionally contains M105,
  M106, and M115 rather than pretending these are separate review branches.

Guardrails:

- Push requires separate exact approval for the command.
- Draft PR creation requires separate exact approval after push evidence exists.
- The PR must remain draft unless a later ready-for-review gate is approved.
- PR body must name the shared-stack nature, source queues, branch head, base,
  and review caveat.

### Option B - Split Or Surgery Planning

Do not publish the shared branch yet. Prepare a design-only split/surgery plan
for separating M105, M106, and M115 into narrower review branches.

Rationale:

- Separate PRs may produce cleaner review boundaries.
- This can reduce review burden if the historical stack is too broad.

Risks:

- Splitting a 251-commit branch may require cherry-pick, rebase, reset, force
  push, branch pointer moves, or branch deletion.
- Mistakes could lose auditability, break commit evidence linkage, or create
  misleading PR history.
- The operation is much riskier than publishing one draft review branch.

Guardrails:

- C005 may prepare design-only split planning if explicitly approved.
- No split execution may occur in C005.
- Any later surgery must name exact commands and rollback evidence before
  execution approval.

### Option C - Defer

Leave the shared branch local-only and record the decision as deferred.

Rationale:

- This is lowest immediate mutation risk.
- It preserves time to inspect the 251-commit stack further.

Risks:

- M105, M106, and M115 remain unpublished.
- The historical branch may become harder to reason about as main advances.

## Recommendation

Prefer Option A: shared-stack publication as one draft PR, with strict approval
gates. It is the least destructive path because it preserves the existing
branch history and avoids branch surgery. The branch is technically suitable
for publication as a draft review branch because `origin/main` is its merge
base and ancestor, the conflict probe is clean, the remote branch is absent, and
no PR already exists for the head branch.

This recommendation is not approval. It only makes C003 ready as the next
approval-gated candidate.

## Go Criteria For C003

C003 may push only after the user approves the exact command. Suggested approval
text:

`Approve M124 C003 push: run git -C /Users/archy/Projects/StartUp/openworkflow push origin codex/m101-build-proto-prompt-command-split:refs/heads/codex/m101-build-proto-prompt-command-split`

Before executing C003, re-check:

- Local target branch head still equals `f8bf087211316506f48155859f3e18edbc7224e4`.
- Remote target branch is still absent or matches the expected approved state.
- Existing PR list for the target branch is still empty.
- Working tree mutations remain scoped to planning evidence.

## Stop Criteria

- Stop if the target branch head changes before approval.
- Stop if the remote target branch appears unexpectedly.
- Stop if an existing PR appears for the target branch.
- Stop before any push without exact approval.
- Stop before draft PR creation without separate exact approval.
- Stop before ready-for-review transition, merge, PR edit/close, or Issue
  mutation.
- Stop before cherry-pick, rebase, reset, force-push, branch deletion, branch
  pointer moves, or split history without separate exact approval.

## Resulting Queue State

- C002 is complete as an evidence-only decision report.
- C003 is ready only as an approval-gated shared-branch push.
- C005 remains available if the user rejects shared-stack publication and
  explicitly asks for design-only split/surgery planning.
