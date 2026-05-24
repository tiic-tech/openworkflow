# C007 Implementation Brief

## Goal

Teach `select-change` how to handle explicit cross-queue arbitration while
keeping one active queue as the normal default.

## Read First

- `skills/select-change/SKILL.md`
- `skills/select-change/references/selection-protocol.md`
- `references/planning-artifact-contracts.md`
- `changes/M72-remaining-change-priority-analysis/CHANGE_ANALYSIS.yaml`
- `changes/M54-decompose-select-change-planning/C007-cross-queue-selection/SELECTED_CHANGE.yaml`

## Do

- Add a clear cross-queue arbitration mode to `select-change`.
- Preserve the branch-boundary and dirty-tree guards before selection.
- Document how rejected alternatives should record both `plan_id` and
  `candidate_id`.
- Explain when a cross-queue decision should select inside the target queue
  versus create a separate analysis artifact first.
- Capture the M72 decision as dogfood evidence for M68/H003, M69/S001,
  M70/G005, and M54/C007.

## Do Not

- Do not expose runtime `/ow:*` command surfaces.
- Do not implement a CLI queue selector.
- Do not change candidate id semantics inside existing queues.
- Do not edit generated `.agents/` or `.openworkflow/` surfaces.
- Do not select or implement C004 in this change.

## Owned Paths

- `skills/select-change/`
- `references/planning-artifact-contracts.md`
- `changes/M54-decompose-select-change-planning/C007-cross-queue-selection/`
- `changes/M54-decompose-select-change-planning/CANDIDATE_CHANGES.yaml`
- `changes/M54-decompose-select-change-planning/CANDIDATE_CHANGES.md`
- `changes/M54-decompose-select-change-planning/SUMMARY.yaml`

## Validation

```bash
python3 /Users/archy/.codex/skills/.system/skill-creator/scripts/quick_validate.py skills/select-change
npm run validate
```

## Stop Conditions

- Stop if the work requires runtime registry, adapter generation, or CLI command
  selector changes.
- Stop if the best next target becomes high risk without a high-risk decision
  report and explicit user approval.
- Stop if unrelated dirty paths appear in the working tree.
