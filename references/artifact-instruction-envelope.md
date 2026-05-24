# Artifact Instruction Envelope

This reference defines a possible dynamic instruction layer for OpenWorkflow.
It is a design contract only. It does not add a CLI command, generated runtime
surface, or artifact schema.

## Decision

OpenWorkflow should keep runtime skills static and repo-local. Static skills
define what `/ow:*` commands mean: required context, forbidden context, allowed
outputs, handoff gates, and durable artifact boundaries.

Dynamic instruction envelopes are useful as a future per-artifact or per-task
output layer, not as a replacement for skills. They should be generated only
when an agent needs a narrow implementation packet for a selected artifact,
selected change, or selected atom task.

Do not implement a public envelope command yet. For now, treat this as a design
pattern that can later be attached to `brief`, `context`, `inspect`, or a new
explicit command after a separate change accepts the product surface.

## When To Use An Envelope

Use a dynamic envelope when the agent needs executable guidance for a specific
unit of work:

- selected change implementation
- selected atom task execution
- artifact repair
- focused verification
- handoff from one command stage to the next

Do not use an envelope for durable product truth. Durable truth belongs in the
artifact itself, its index, summary, or current-state pointer.

## Candidate Shape

An envelope may use XML-like tags when boundaries matter more than human
editing:

```xml
<instruction_envelope>
<task>
Implement the selected atom task without widening scope.
</task>

<context>
Load the selected change, atom tasks, and only the referenced source files.
</context>

<rules>
- Stay inside owned_paths.
- Do not create forbidden_outputs.
- Record blockers instead of expanding scope.
</rules>

<dependencies>
- S001-skill-lifecycle-contract
</dependencies>

<output>
Return changed files, validation evidence, and remaining risks.
</output>

<success_criteria>
- Validation passes.
- Completion evidence is attached to the selected change.
</success_criteria>
</instruction_envelope>
```

Candidate tags:

- `<task>`: the exact work to perform.
- `<context>`: required and optional context packets.
- `<rules>`: constraints that must be followed.
- `<dependencies>`: upstream artifacts or changes that must remain true.
- `<input>`: user-provided or artifact-provided inputs.
- `<output>`: expected response or file outputs.
- `<template>`: optional shape for a produced artifact.
- `<success_criteria>`: completion checks.
- `<handoff>`: downstream command or unresolved blocker.

## Format Choice

Use XML-like tags when an agent must distinguish instructions from content,
when there are multiple boundary types, or when leakage would be damaging.

Use Markdown when the envelope is mostly human-readable guidance and does not
need strict machine-locatable boundaries.

Use YAML when the output must be queried, diffed, merged, or validated as data.
Candidate queues, selected changes, atom tasks, current state, and artifact
indexes should remain YAML.

Do not serialize an entire artifact as XML-like instructions. Artifacts keep
their existing contract formats.

## Leakage Prevention

Instruction envelopes are agent constraints, not artifact content. Agents must
not copy envelope tags, internal rules, hidden critique prompts, or working
protocol into user-facing artifacts unless the artifact schema explicitly asks
for that field.

Every future envelope producer must follow these rules:

- Label the output as an instruction envelope, not an artifact.
- Name the target artifact or task id.
- Include owned paths and forbidden paths.
- Keep inner reasoning instructions out of durable artifacts.
- Strip envelope tags before writing Markdown notes, specs, or product docs.
- Prefer references to source artifacts over copying large source bodies.
- Include validation expectations and stop conditions.

## Relationship To Existing Surfaces

Static runtime skills live in `.agents/skills/ow-*/SKILL.md` and are generated
from command and artifact registries.

Dynamic envelopes, if implemented later, should be derived from the same source
contracts plus the selected artifact state. They should not fork command
semantics.

The likely future integration points are:

- `openworkflow brief --for /ow:<command>` for command-specific packets.
- `openworkflow context --handoff` for handoff-ready context.
- `select-change` output for selected change execution packets.
- `run-team` runtime handoff packets for agent teams.

Each integration point requires a separate change before it becomes product
behavior.
