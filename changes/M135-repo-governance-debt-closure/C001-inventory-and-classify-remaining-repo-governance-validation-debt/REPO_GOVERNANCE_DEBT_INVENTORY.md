# M135 C001 Repo Governance Debt Inventory

Captured at: 2026-05-25T08:32:25+08:00

## Validation Snapshot

`npm run validate` still fails after a successful TypeScript build. The failures are all historical
non-M135 governance artifacts or examples; no M135 source implementation has started.

## Failure Families

### F001 Planning Artifact Shape

Owned by C002.

- Missing `title` keys in historical `ATOM_TASKS.yaml` files:
  - M100 C003-C007
  - M101 C001-C005
  - M105 C001-C004
  - M97 C003-C004
- Non-string `completion.evidence` values:
  - M100 C005
- Missing completion evidence:
  - M101 C001
  - M97 C001-C004

Repair posture: mechanical where existing artifacts already support the historical completion claim.
Do not invent evidence.

### F002 Historical Local Commit Evidence Metadata

Owned by C003.

- Missing validation evidence:
  - M87 C002
  - M87 C003
  - M87 C004
  - M88 C001
  - M88 C002
  - M92 C001
  - M92 C002
- Missing primary or implementation commit hash:
  - M87 C003
  - M92 C001
  - M92 C002

Repair posture: high-risk. Only bind existing verifiable commits and recorded/rerunnable validation.
If proof is unavailable, record unresolved debt rather than fabricate audit facts.

### F003 High-Risk Decision Report Compliance

Owned by C004.

- Missing required sections in M101, M105, and M117 high-risk reports.
- M102 report must state implementation resumes only after explicit approval.

Repair posture: document-shape repair. Preserve original decision and do not imply new approval.

### F004 Parse and Schema Edge Artifacts

Owned by C005.

- M113 `CANDIDATE_CHANGES.yaml` has invalid YAML caused by an unquoted backtick-starting scalar.
- `examples/m98-smart-city-replay/PROTO_PROMPT_PACK.yaml` has `prototype_system_contract` as a
  non-mapping where current validation requires a mapping.

Repair posture: focused parse/schema repair unless C005 proves a validator false positive.

### F005 Optional Regression Guardrails

Owned by C006 if needed.

If C002-C005 reveal validators lack a fixture for a repaired family, add focused regression
guardrails. Do not relax validators to hide real debt.

## Candidate Unlocks

- C002 can repair mechanical planning artifact shape debt.
- C003 can repair historical local commit evidence metadata under high-risk evidence constraints.
- C004 can repair high-risk report compliance.
- C005 can repair parse/schema edge artifacts.
- C006 can add guardrails only if a concrete regression gap is found.

## Stop Conditions

- Stop if a repair requires fabricating commit hashes, validation commands, or completion evidence.
- Stop if a validator change would weaken current governance checks without a proven false positive.
- Stop before any remote mutation unless explicitly routed through git governance.
