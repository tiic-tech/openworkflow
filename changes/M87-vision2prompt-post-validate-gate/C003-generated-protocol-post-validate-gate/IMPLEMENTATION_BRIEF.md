# C003 Implementation Brief

## Goal

Wire the prompt asset post-validate gate into the generated `/ow:vision2prompt`
and `/ow:proto` protocol surfaces. The source of truth should be the command
registry and verifier source, followed by `openworkflow sync`; do not manually
patch generated skills or `.openworkflow` audit files.

## Required Behavior

- `/ow:vision2prompt` must treat prompt text as handoff-ready only after
  `post_validate.status` is `pass` for resolved direction counts of 2 or more.
- `/ow:vision2prompt` must record `post_validate.status: skipped` when the user
  explicitly requested exactly one strategic direction.
- `/ow:vision2prompt` must route failed post-validation back into prompt repair
  instead of handing off to `/ow:prompt2proto`.
- `/ow:proto` must wait for `post_validate.status` `pass` or `skipped` before
  invoking `/ow:prompt2proto`.

## Verification Focus

Verification should prove generated surfaces contain the gate language after
sync and that drift is caught by runtime or E2E checks. Use existing generated
surface verifiers before adding new test machinery.
