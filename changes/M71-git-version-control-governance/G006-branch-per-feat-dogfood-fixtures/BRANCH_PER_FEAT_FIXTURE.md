# Branch-Per-Feat Dogfood Fixture

This fixture captures the expected audit chain for a branch-governed OW feat.

```text
Issue -> CANDIDATE_CHANGES -> selected change -> commit
CANDIDATE_CHANGES -> feat branch -> PR_READY_SUMMARY -> PR review
```

## Expected Boundaries

- Issue: intent or problem source.
- `CANDIDATE_CHANGES.yaml`: feat boundary.
- `queue_policy.branch_boundary`: owning feat branch.
- selected change: one commit-sized implementation unit.
- atom task: implementation checklist inside one selected change.
- `PR_READY_SUMMARY.md`: review handoff artifact.

## Audit Evidence

The M71 dogfood queue should show:

- `branch_boundary: codex/m71-git-version-governance`
- completed selected-change evidence for completed candidates
- validation commands for each completed candidate
- a next recommended candidate for continued non-high-risk work

## Non-Goals

This fixture does not mutate git state, push a branch, open a PR, edit Issues,
or call `gh`.
