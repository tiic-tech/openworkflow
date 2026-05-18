# M03 Acceptance

M03 is complete when OpenWorkflow can turn a validation contract into a focused
prototype loop without creating production specs, changes, teams, or runtime
state.

Required evidence:

- `prototype` is a first-class contract type.
- `schemas/prototype.schema.json` defines the minimum prototype artifact.
- `skills/build-prototype/` can initialize prototype discovery artifacts.
- The golden path shows validation -> prototype -> decision before production
  flow.
- `python3 scripts/validate_openworkflow.py --root .` passes.

