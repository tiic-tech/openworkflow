# C003 Implementation Brief

Upgrade generated `/ow:validation` protocol so it matches the native
`build-validation` contract and the expanded validation target artifact.

## Implementation Notes

- Update source command protocol in `packages/core/src/commands/registry.ts`.
- Keep `/ow:validation` as the only durable writer of validation artifacts.
- Make generated guidance ask for one central uncertainty, one prototype
  experiment boundary, observable pass/fail/ambiguous signals, decision rules,
  and explicit vision gaps.
- Preserve the no-prototype boundary: validation may define the experiment, but
  must not generate prototype prompts, images, HTML, specs, or changes.
- Run `openworkflow sync` and commit generated surface updates.

## Out Of Scope

- Do not change validation schemas in C003.
- Do not change `/ow:proto` prompt generation or runtime behavior in C003.
