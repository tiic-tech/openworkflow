# C005 Implementation Brief

Formalize `/ow:proto` as a user-facing orchestrator backed by smaller internal
commands:

- `/ow:vision2prompt`: consumes ready vision and validation, then writes the
  strategic multi-direction prompt text artifacts.
- `/ow:prompt2proto`: consumes ready prompt text, generates high-fidelity image
  groups, and records per-image metadata.

The internal commands must be generated as internal skills so agents can consume
them as smaller tools, but they must not appear as normal user-facing next
commands.

Prototype artifacts should record the pipeline stage state and every generated
image should have metadata linking it back to direction, prompt text, generator,
and source artifact.
