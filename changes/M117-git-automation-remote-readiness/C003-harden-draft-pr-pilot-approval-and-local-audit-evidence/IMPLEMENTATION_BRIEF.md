# M117 C003 Implementation Brief

Implement the Option D-approved draft PR pilot hardening without executing real
remote PR mutation.

## Goal

`git-automation draft-pr --write --allow-draft-pr` must not be enough to create
or edit a draft PR. Write mode must require explicit approval evidence and must
produce durable local audit evidence for any future approved write path.

## Constraints

- Do not execute real `gh pr create` or `gh pr edit` in this candidate.
- Do not push, merge, mutate Issues, mark PR ready for review, rebase, reset, or
  force-push.
- Keep preview mode non-mutating and useful without approval evidence.
- Keep C004 merge-conflict checkpointing out of this change.
- Do not hand-edit generated `.agents/**` or `.openworkflow/**` surfaces.

## Expected Shape

- Add approval evidence inputs to `draft-pr` command/core options.
- Fail write mode closed when approval evidence is missing or invalid.
- Preserve preview mode behavior.
- Define local audit evidence fields and fixture coverage.
- Complete through `git-automation commit` with local commit evidence.

## Completion Notes

- `draft-pr --write --allow-draft-pr` now also requires
  `--approval-evidence <source>`.
- Approved write-mode paths write `DRAFT_PR_OPERATION_EVIDENCE.yaml` by default
  next to the queue, or the path named by `--audit-evidence`.
- Runtime-surface coverage uses fake `gh` for approved write evidence; no real
  PR create or edit was executed.
- After local commit evidence is recorded, the next queue-local action is C004.
