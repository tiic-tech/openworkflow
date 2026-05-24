# M117 C001 Implementation Brief

Implement the smallest shared local evidence reader that makes current
git-automation reports consume modern selected-change commit evidence.

## Goal

`git-automation summary`, `remote-plan`, and `simulate` should report ordered
local commit and validation evidence from selected-change
`LOCAL_COMMIT_EVIDENCE.yaml` files, while still accepting older completion
evidence entries such as `commit:<hash>`.

## Constraints

- Do not enable push, PR mutation, Issue mutation, merge, rebase, reset, or
  force-push.
- Keep the durable implementation in source files, not generated `.agents/**`
  or `.openworkflow/**` surfaces.
- Preserve legacy evidence compatibility.
- Keep C002 branch identity and C004 merge-conflict checkpoint work out of this
  change unless a tiny interface hook is needed for the evidence reader.

## Expected Shape

- Add one shared reader under `packages/core/src/git/`.
- Use it from PR-ready summary, remote read-only planner, and autonomous
  simulator.
- Add a targeted fixture that fails before the reader is wired in and passes
  after M114-style `LOCAL_COMMIT_EVIDENCE.yaml` records are consumed.
- Complete C001 through `git-automation commit` so the implementation commit and
  evidence commit relationship is recorded in this selected-change folder.
