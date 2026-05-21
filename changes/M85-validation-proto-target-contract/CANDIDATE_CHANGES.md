# M85 Validation Proto Target Contract

Source of truth: `CANDIDATE_CHANGES.yaml`.

This queue upgrades `/ow:validation` only. It makes validation the bridge that
turns proto-ready vision into one prototype validation target. It does not
change `/ow:proto`, `/ow:tune`, or the full discovery-loop E2E.

## Scope Boundary

Current boundary: `/ow:validation` as a prototype validation target compiler.
It should identify the central uncertainty, prototype experiment boundary,
observable evidence, decision rules, and vision gaps that must be resolved
before `/ow:proto`.

Deferred features:

- `M86-proto-strategy-prompt-compiler`
- `M87-tune-product-system-inheritance`
- `M88-discovery-loop-read-model`
- `M89-discovery-loop-e2e-dogfood`

Branch boundary: `codex/m73-workflow-blueprint-runtime-alignment`

Completed candidates: none

Selected candidate: `C001`

Next recommended candidate: none until `C001` is completed or superseded.

## Candidates

### C001 - Define native build-validation prototype-target compiler contract

Status: `selected`

Risk: `medium`

Repositions `skills/build-validation` around experiment compilation and
return-to-vision gating.

Selection: `C001-build-validation-prototype-target-contract`

### C002 - Extend validation_target artifact with experiment brief fields

Status: `candidate`

Risk: `medium`

Adds structured fields that let `/ow:proto` consume validation as an experiment
brief.

### C003 - Upgrade /ow:validation generated protocol for experiment compilation

Status: `candidate`

Risk: `medium`

Updates generated `/ow:validation` guidance and context packets after artifact
shape stabilizes.

### C004 - Add validation target stress fixtures

Status: `candidate`

Risk: `medium`

Adds thin, vision-gap blocked, and proto-ready validation fixtures.
