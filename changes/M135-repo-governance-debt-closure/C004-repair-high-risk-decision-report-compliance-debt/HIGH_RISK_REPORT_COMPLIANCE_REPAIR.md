# M135 C004 High-Risk Report Compliance Repair

## Repairs

- M101 now exposes required Trigger, Change, Concrete Risks, Decision Options, Recommended Path, and
  Validation Expectations sections while preserving its design-only command split decision.
- M102 now explicitly states that implementation resumes only after explicit approval.
- M105 now exposes all required high-risk report sections and explicit approval language while
  preserving the narrow safe backfill recommendation.
- M117 now exposes required Change, Concrete Risks, Recommended Path, and Go Criteria sections while
  preserving its local/read-only remote-readiness boundary.

## Preservation

The repair is document-shape and approval-boundary clarification only. It does not grant new
implementation approval, remote approval, merge permission, source behavior changes, or generated
surface edits.

## Validation

After the repair, `npm run validate` no longer reports high-risk report compliance failures.
Remaining validation failures are assigned to C005 parse/schema edge artifacts.
