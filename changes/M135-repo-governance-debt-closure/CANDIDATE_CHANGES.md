# M135 Repo Governance Debt Closure

Status: active

## Scope

M135 covers the remaining repository-wide historical governance and validation debt after M134
finished the git/PR lifecycle baseline. It does not implement product features and does not mutate
remote state.

Current validation still fails on historical non-M134 artifacts. The queue is scoped to making those
failures explicit, repairable, and eventually clean enough for `npm run validate` to become the
default development baseline.

## Queue Policy

- Branch boundary: `codex/m135-repo-governance-debt-closure`
- Git lifecycle gate: strict
- Next recommended candidate: C007
- Selected-change commit gate: strict

## Candidates

### C001 - Inventory and classify remaining repo governance validation debt

Status: done
Risk: medium

Produce a precise inventory of current validation failures and classify each repair family.

Acceptance:

- Every current validation failure is assigned to a repair family.
- High-risk evidence repairs are identified before edit.
- No historical artifact or validator behavior changes in C001.

Result:

- Wrote `C001-inventory-and-classify-remaining-repo-governance-validation-debt/REPO_GOVERNANCE_DEBT_INVENTORY.md`.
- Classified validation failures into C002-C006 repair families.
- Did not modify historical debt artifacts.

### C002 - Normalize historical planning artifact shape debt

Status: done
Risk: medium

Repair mechanical planning artifact shape failures in M100, M101, M105, and M97.

Acceptance:

- Mechanical artifact-shape failures for the owned queues are removed or explicitly deferred.
- Historical intent is preserved.
- No commit evidence is fabricated.

Result:

- Added missing top-level `title` keys to scoped historical atom-task files.
- Normalized the M100 C005 completion evidence item shape.
- Added M101 C001 and M97 C001-C004 completion evidence only from existing historical artifacts.
- Remaining validation debt is outside C002 and assigned to C003-C005.

### C003 - Repair historical local commit evidence metadata

Status: done
Risk: high

Repair M87, M88, and M92 local commit evidence only where existing git history and artifacts support
the audit claim.

Acceptance:

- Evidence records are repaired only where verifiable.
- Unverifiable historical evidence remains explicitly documented.
- No false historical audit claim is introduced.

Result:

- Added validator-recognized commit metadata to historical M87, M88, and M92 evidence files.
- Added top-level `validation_evidence` from existing recorded verification or validation fields.
- Preserved target-repo commits as target-repo evidence rather than local OpenWorkflow commits.

### C004 - Repair high-risk decision report compliance debt

Status: done
Risk: medium

Bring M101, M102, M105, and M117 high-risk reports into the current section contract.

Acceptance:

- High-risk report section failures are removed or explicitly deferred.
- Reports remain faithful to historical decision scope.
- No new implementation approval is implied.

Result:

- Added required section headings to M101, M105, and M117 high-risk reports.
- Added explicit approval-boundary language where required.
- Preserved each report's original decision scope and did not add new implementation approval.

### C005 - Repair parse and schema edge artifacts

Status: done
Risk: medium

Resolve the isolated M113 YAML parse failure and M98 prompt-pack schema edge failure.

Acceptance:

- M113 parses as YAML.
- M98 either matches the current schema or is explicitly deferred with rationale.

Result:

- Quoted the M113 backtick-starting YAML scalar.
- Added a mapping-shaped M98 `prototype_system_contract` from existing prompt-pack content.
- Did not relax parser or validator behavior.

### C006 - Add governance debt regression guardrails if needed

Status: done
Risk: medium

Add focused validator or fixture guardrails only if C001 finds a real regression gap.

Acceptance:

- Any source change is tied to a concrete C001 regression gap.
- Validators remain strict for real governance debt.
- Generated surfaces are not manually patched.

Result:

- No validator or fixture source change was needed.
- Existing validation already caught the repaired debt families.
- `npm run validate` passed after C002-C005 repairs and evidence normalization.

### C007 - Complete repo governance validation debt handoff

Status: ready
Risk: medium

Record the final repo governance debt state after repairs and state whether whole-repo validation is
clean.

Acceptance:

- The handoff states whether `npm run validate` is clean.
- Any remaining debt is explicit and bounded.
- No unauthorized remote operation is recorded.
