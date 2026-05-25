# M135 C004 Implementation Brief

## Goal

Repair historical `HIGH_RISK_DECISION_REPORT.md` section compliance failures without changing the
decisions those reports originally recorded.

## Output

- Add missing required section headings and concise compatibility text to M101, M105, and M117.
- Add explicit implementation-resumes-only-after-approval language to M102 and M105 where required.
- Record the repair boundary in `HIGH_RISK_REPORT_COMPLIANCE_REPAIR.md`.

## Boundaries

C004 must not retroactively approve implementation, remote mutation, source behavior changes, or
any work beyond historical report shape and approval-boundary clarity.
