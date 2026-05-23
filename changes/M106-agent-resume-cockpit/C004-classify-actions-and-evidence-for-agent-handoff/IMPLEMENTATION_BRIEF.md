# M106 C004 Implementation Brief

## Goal

Make `resume --json` carry the behavior boundary a fresh Agent needs before
continuing implementation: allowed actions, forbidden actions, stop conditions,
primary/auxiliary/comparison evidence, owned and forbidden paths, validation
expectations, and git-governance constraints.

## Read First

- `changes/M106-agent-resume-cockpit/CANDIDATE_CHANGES.yaml`
- `changes/M106-agent-resume-cockpit/C004-classify-actions-and-evidence-for-agent-handoff/SELECTED_CHANGE.yaml`
- `packages/core/src/workflow/planningQueueResume.ts`
- `packages/cli/src/commands/resume.ts`

## Do

- Reuse queue and selected-change fields before inventing new policy.
- Surface allowed/forbidden actions and stop conditions in the resume packet.
- Classify evidence as primary, auxiliary, comparison, and missing.
- Surface owned paths, forbidden paths, validation commands, acceptance checks,
  and commit evidence expectations for the current work item.
- Expose product-alignment/current pointer context when available.

## Do Not

- Do not enforce write preflight or block writes programmatically.
- Do not implement artifact lineage or vision-product drift scoring.
- Do not mutate queue status from `resume`.
- Do not hand-edit generated `.agents/**` or `.openworkflow/**`.

## Owned Paths

- `packages/core/src/workflow/`
- `packages/cli/src/commands/`
- `packages/cli/src/dev/verifyRuntimeSurface.ts`
- `changes/M106-agent-resume-cockpit/`

## Validation

- `npm run build`
- `npm run verify:runtime-surface`
- `node dist/cli/src/index.js resume --root . --json`
- `node dist/cli/src/index.js validate --root . --json`
- `node dist/cli/src/index.js summaries --root . --strict --json`
- `node dist/cli/src/index.js handoff --root . --json`
- `git diff --check`

## Stop Conditions

- The change requires enforcing write preflight.
- The change requires lineage graph schema or product drift scoring.
- Behavior boundaries cannot be derived from queue/selected-change/current
  command evidence.
