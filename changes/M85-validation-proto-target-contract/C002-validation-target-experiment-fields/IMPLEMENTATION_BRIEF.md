# C002 Implementation Brief

Extend `validation_target` so agents can consume validation as a prototype
experiment brief.

The important boundary is write authority: `/ow:validation` remains the formal
command that creates or updates validation artifacts. Downstream agents can use
validation as a built-in read-only gate, especially before `/ow:proto`, but
they must not silently write validation artifacts.

## Implementation Notes

- Add structured experiment fields to the validation target schema and template.
- Make summary quality and readiness checks treat missing experiment fields as
  thin validation.
- Expose semantic readiness through `openworkflow check` so agents can see
  `missing_validation`, `thin_validation`, `stale_validation`,
  `ready_for_proto`, or `return_to_vision`.
- Preserve existing validation artifact compatibility where possible.
- Refresh generated audit contracts through `openworkflow sync`; generated
  skill changes in this change are limited to artifact-contract projection, not
  command protocol wording.

## Out Of Scope

- Generated `/ow:validation` protocol wording belongs to C003.
- `/ow:proto` runtime behavior and prompt generation belongs to M86.
- Do not create real `.openworkflow/validation/**` artifacts for this change.
