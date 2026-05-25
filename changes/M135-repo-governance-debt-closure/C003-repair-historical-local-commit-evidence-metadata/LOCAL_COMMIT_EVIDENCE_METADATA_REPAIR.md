# M135 C003 Local Commit Evidence Metadata Repair

## Repairs

- M87 C002, C003, and C004 now include validator-recognized `implementation_commit` values resolved
  from the existing short commit ids and top-level `validation_evidence` derived from their existing
  `verification.commands` lists.
- M88 C001 and C002 now include validator-recognized `implementation_commit` values resolved from
  the existing short commit ids and top-level `validation_evidence` derived from their existing
  `verification.commands` lists.
- M92 C001 and C002 now include repo-local `primary_commit` values from path-specific git history
  and top-level `validation_evidence` derived from existing target-repo validation notes.

## Truth Boundary

The M92 records already contained `target_repo.commit` for the external smart city repository. C003
does not reinterpret those target-repo commits as local OpenWorkflow implementation commits. The
new `primary_commit` field records the repo-local commit that carried the evidence file.

## Validation

After the repair, `npm run validate` no longer reports the M87, M88, or M92 local commit evidence
metadata failures. Remaining failures are assigned to C004 high-risk report compliance and C005
parse/schema edge artifacts.
