# C004 Implementation Brief

Add explicit stress fixtures for validation target readiness states.

## Implementation Notes

- Cover `thin_validation` when a current validation artifact lacks experiment
  fields.
- Cover `return_to_vision` when a validation target names gaps that would force
  `/ow:proto` to invent product strategy.
- Cover `ready_for_proto` when the target has central uncertainty, target
  behavior, prototype experiment, observable signals, and decision rules.
- Keep this change test-only.

## Out Of Scope

- Do not change command semantics or schemas.
- Do not generate prototype artifacts.
