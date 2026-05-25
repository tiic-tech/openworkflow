# M135 C001 Implementation Brief

## Goal

Inventory current repository validation failures and classify the remaining governance debt before
repair work begins.

## Output

- `REPO_GOVERNANCE_DEBT_INVENTORY.md`
- Queue update marking C001 done and C002-C006 ready.

## Boundaries

C001 is read-only against historical debt. It may create M135 planning evidence but must not modify
historical artifacts, relax validators, or mutate remote state.
