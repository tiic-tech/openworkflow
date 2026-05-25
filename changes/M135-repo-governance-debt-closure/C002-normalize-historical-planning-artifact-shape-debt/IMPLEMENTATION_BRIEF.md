# M135 C002 Implementation Brief

## Goal

Repair mechanical historical planning artifact shape debt so the remaining validation output is
limited to later M135 repair families.

## Output

- Add top-level `title` keys to scoped historical `ATOM_TASKS.yaml` files.
- Normalize the M100 completion evidence item that was encoded as a mapping.
- Add completion evidence references for M101 and M97 only where existing artifacts already support
  the historical claim.
- Record C002 repair evidence in `PLANNING_ARTIFACT_SHAPE_REPAIR.md`.

## Boundaries

C002 must not change source behavior, fabricate commit hashes, invent validation commands, mutate
remote state, or alter historical intent beyond current artifact contract shape.
