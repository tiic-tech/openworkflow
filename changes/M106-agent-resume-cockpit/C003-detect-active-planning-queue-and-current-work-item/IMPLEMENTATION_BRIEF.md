# M106 C003 Implementation Brief

## Goal

Teach `resume --json` to identify the obvious active planning queue and current
work item so a fresh Agent can resume the real queue-local breakpoint instead
of falling back to generic `CURRENT_STATE.next_command`.

## Read First

- `changes/M106-agent-resume-cockpit/CANDIDATE_CHANGES.yaml`
- `changes/M106-agent-resume-cockpit/C003-detect-active-planning-queue-and-current-work-item/SELECTED_CHANGE.yaml`
- `packages/cli/src/commands/resume.ts`
- `references/planning-artifact-contracts.md`

## Do

- Add read-only detection for obvious `changes/*/SUMMARY.yaml` and
  `CANDIDATE_CHANGES.yaml` planning queues.
- Prefer an active selected candidate over generic workflow state.
- Report selected, completed, next recommended/ready candidates, queue boundary
  override reasons, missing commit evidence, and likely breakpoint.
- Rank the smallest queue-local next action when evidence is clear.
- Keep broad historical queue analysis out of scope.

## Do Not

- Do not select candidates or mutate queue status from `resume`.
- Do not refresh summaries, write commit evidence, or touch generated surfaces.
- Do not implement C004 action/evidence policy beyond the queue-local next
  action needed for C003.

## Owned Paths

- `packages/core/src/workflow/`
- `packages/cli/src/commands/`
- `packages/cli/src/dev/verifyRuntimeSurface.ts`
- `changes/M106-agent-resume-cockpit/`

## Validation

- `npm run build`
- `npm run verify:runtime-surface`
- `node dist/cli/src/index.js resume --root . --json`
- `git diff --check`

## Stop Conditions

- Detection requires selecting or editing a queue.
- Multiple active queues compete without an obvious rank.
- The implementation needs broad historical repository analysis.
