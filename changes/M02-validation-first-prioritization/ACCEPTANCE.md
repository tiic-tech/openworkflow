# M02 Acceptance

M02 is complete when OpenWorkflow can decide what must be validated before it
creates implementation work.

Required evidence:

- `validation` is a first-class contract type.
- `schemas/validation.schema.json` defines the minimum validation artifact.
- `skills/build-validation/` can initialize validation contracts and prototype
  briefs.
- The golden path includes validation before change and work item execution.
- `python3 scripts/validate_openworkflow.py --root .` passes.

