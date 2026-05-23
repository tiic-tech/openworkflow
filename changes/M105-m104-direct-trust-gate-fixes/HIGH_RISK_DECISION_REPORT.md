# M105 High Risk Decision Report

## Candidate

C003 - Auto-backfill commit evidence into selected-change completion

## Why This Is High Risk

C003 changes the behavior of `git-automation commit --commit-evidence`, which is
part of the strict selected-change commit gate. A broad implementation could
silently mutate planning artifacts, mask incomplete completion records, or make
historical queues appear healthier than they are.

M104 exposed a real pain point: after the implementation commit, the evidence
file existed only after `git-automation` wrote it, but strict `summaries` and
`handoff` expected queue/selected-change completion records to already reference
that evidence. The current workflow forces manual repair or careful pre-linking.

## Option A - Narrow Safe Backfill (Recommended)

Implement only a conservative backfill inside `git-automation commit` when all
of these are true:

- `--commit-evidence` is present.
- `--evidence-path` is inside the selected candidate folder.
- The selected candidate is already marked `done`.
- The queue candidate has a `completion` object.
- The selected-change artifact has a `completion` object.
- The evidence path is absent from one or both completion evidence arrays.

Behavior:

- Add the evidence path to existing completion evidence arrays.
- Do not create a new completion section.
- Do not mark any candidate done.
- Do not change validation results, status, scope, or owned paths.
- Emit a warning when backfill is skipped and name the unmet precondition.
- Cover the M104-style missing-evidence repair loop in runtime verification.

This addresses the defect while keeping status transitions under explicit
agent control.

## Option B - Diagnostic Only

Do not mutate planning artifacts. Improve `git-automation` output so it tells
the Agent exactly which completion evidence arrays need the evidence path before
commit.

This is safer but leaves the manual repair loop in place.

## Option C - Defer

Leave C003 unselected and move to C004 first.

This avoids touching git automation now, but M104's strict evidence closure
friction remains unfixed.

## Recommendation

Approve Option A for C003. It is the smallest durable fix that removes the
manual evidence-link repair loop while preserving strict status ownership.
