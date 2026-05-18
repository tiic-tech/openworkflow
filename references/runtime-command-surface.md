# Runtime Command Surface

M12 responds to dogfooding feedback from a real
`/ow:vision -> /ow:validation -> /ow:proto -> /ow:decision` run.

## OpenSpec Findings

OpenSpec separates what a command means from where a tool expects that command
to live:

- Command content is tool-agnostic.
- Tool adapters decide file path and frontmatter.
- Codex commands are global prompts under `$CODEX_HOME/prompts/`, not
  project-local command files.
- Skills remain project-local under `.codex/skills/`.
- Artifact instructions use XML-style tags such as `<task>`, `<rules>`, and
  `<template>`.
- HTML comments tell the agent which sections are constraints and must not be
  copied into output artifacts.

OpenWorkflow should adopt the adapter separation and XML/comment convention,
but keep its own validation-first discovery loop.

## Minimal Init

`openworkflow init` should create only the runtime substrate:

```txt
.openworkflow/
  config.yaml
  workflow/
    WORKFLOW_INDEX.yaml
  audit/
    COMMAND_AUDIT_INDEX.yaml
    CONTEXT_PACKETS.yaml
    ARTIFACT_CONTRACTS.yaml
    DISCLOSURE_LEVELS.yaml
```

Stage directories are lazy-created by commands:

- `/ow:vision` creates `.openworkflow/vision/`.
- `/ow:validation` creates `.openworkflow/validation/`.
- `/ow:proto` creates `.openworkflow/prototypes/`.
- `/ow:design` creates `.openworkflow/design/`.
- `/ow:spec` creates `.openworkflow/specs/`.

This keeps a new target repo from pretending every workflow stage already
exists.

## Codex Command Registration

For Codex, slash prompts should be generated at:

```txt
$CODEX_HOME/prompts/ow-vision.md
$CODEX_HOME/prompts/ow-validation.md
$CODEX_HOME/prompts/ow-proto.md
$CODEX_HOME/prompts/ow-design.md
```

Each prompt uses frontmatter:

```yaml
---
description: Start or continue OpenWorkflow vision discovery
argument-hint: user intent or stage feedback
---
```

Repo-local `.codex/commands/ow/*.md` files may still be generated as references,
but they are not the assumed Codex slash registration surface.

## Interactive Command Behavior

Interactive commands should be quiet:

- Ask one clear question.
- Do not narrate routine file reads, writes, or validation.
- Do not run full validation after every user answer.
- Save checkpoints when a stage completes, when the user asks to save, or when
  the command needs a durable handoff.

Agent-only protocol should live in XML-style blocks and comments, for example:

```xml
<agent_protocol>
<!-- Internal instructions. Do not expose routine protocol steps to the user. -->
</agent_protocol>

<user_behavior>
Ask one question at a time. Keep the visible response short.
</user_behavior>
```

## /ow:design

`/ow:design` bridges accepted prototype evidence to product development. It is
not production implementation and not a one-shot giant PRD.

Required artifact:

```txt
.openworkflow/design/<id>/PRODUCT_DESIGN.yaml
```

The required product design should capture:

- accepted prototype evidence
- target users and user personas
- user journey map
- user stories
- feature matrix
- KANO classification and priority
- product behavior model
- UX states and edge cases
- accepted, rejected, and deferred scope
- open questions
- readiness for `/ow:spec`

Conditional packets may be created only when needed:

- `TECH_SPEC.yaml`
- `FRONTEND_SPEC.yaml`
- `BACKEND_SPEC.yaml`
- `API_CONTRACT.yaml`
- `DB_SCHEMA_MODEL.yaml`

These packets must remain opt-in so `/ow:design` does not recreate the artifact
bloat that OpenWorkflow is trying to avoid.
