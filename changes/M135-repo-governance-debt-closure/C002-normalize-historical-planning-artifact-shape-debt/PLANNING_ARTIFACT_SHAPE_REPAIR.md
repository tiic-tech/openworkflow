# M135 C002 Planning Artifact Shape Repair

## Repairs

- Added missing top-level `title` keys to scoped historical `ATOM_TASKS.yaml` files in M100, M101,
  M105, and M97.
- Converted the M100 C005 `completion.evidence` mapping entry to a string so the historical target
  commit note remains visible without violating the current evidence item shape.
- Added M101 C001 completion evidence using the existing high-risk report and selected-change
  planning artifacts.
- Added M97 C001-C004 completion evidence using existing target-repo prototype/decision/audit paths
  and existing local change evidence files.

## Preservation

The repair does not change source behavior, selected-change meaning, historical task content, git
history, or remote state. It does not add commit hashes or validation commands to historical local
commit evidence records; those remain assigned to C003.

## Validation

`npm run validate` was rerun after the repair. The C002-owned missing-title, non-string evidence,
and missing completion evidence failures no longer appear. Remaining failures are assigned to:

- C003: historical `LOCAL_COMMIT_EVIDENCE.yaml` metadata shape in M87, M88, and M92.
- C004: historical `HIGH_RISK_DECISION_REPORT.md` section compliance in M101, M102, M105, and M117.
- C005: M113 YAML quoting and M98 prompt-pack schema shape.
