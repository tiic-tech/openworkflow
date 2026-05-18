# M01 Acceptance

M01 is complete when OpenWorkflow has a repo-local contract foundation that can
be validated and used as the upstream source for future skill work.

Required evidence:

- `skills/build-team/` and `skills/run-team/` preserve the initial downstream
  execution skills.
- `schemas/` defines v0 JSON Schema files for the common contract metadata and
  the first workflow artifacts.
- `skills/build-workflow/` can initialize the workflow contract layout in a
  target repo.
- `scripts/validate_openworkflow.py --root .` passes.
- `examples/golden-path/` shows the smallest practical end-to-end contract
  trace.

