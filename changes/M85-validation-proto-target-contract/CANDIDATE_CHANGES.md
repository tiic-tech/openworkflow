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

Completed candidates: `C001`, `C002`, `C003`, `C004`, `C005`

Selected candidate: none

Next recommended candidate: none. M85 is complete.

## Command Boundary Decision

Validation is both a user-triggered formal command and an agent-auto-triggered
artifact-producing command. When `/ow:proto` is invoked without a current
validation artifact, the agent must first run the same validation pass and write
durable validation artifacts before prototype generation. Auto validation must
record `trigger.mode: agent_auto`, `trigger.requested_command: /ow:proto`, and
`trigger.reason: missing_current_validation`.

## Candidates

### C001 - Define native build-validation prototype-target compiler contract

Status: `done`

Risk: `medium`

Repositions `skills/build-validation` around experiment compilation and
return-to-vision gating.

Selection: `C001-build-validation-prototype-target-contract`

Completed in commit `0acbf94`.

### C002 - Extend validation_target artifact with experiment brief fields

Status: `done`

Risk: `medium`

Adds structured fields that let `/ow:proto` consume validation as an experiment
brief and lets agents evaluate validation through a read-only readiness gate.

Completed in commit `30e3a4e`.

### C003 - Upgrade /ow:validation generated protocol for experiment compilation

Status: `done`

Risk: `medium`

Updates generated `/ow:validation` guidance and context packets after artifact
shape stabilizes.

Completed in commit `4e2f19f`.

### C004 - Add validation target stress fixtures

Status: `done`

Risk: `medium`

Adds thin, vision-gap blocked, and proto-ready validation fixtures.

Completed in commit `c56b3c9`.

### C005 - Make agent-auto validation artifact-producing before proto

Status: `done`

Risk: `medium`

Corrects the prior read-only gate decision so missing validation before
`/ow:proto` becomes an artifact-producing validation preflight, not ephemeral
context.

Completed in commit `c21b560`.
