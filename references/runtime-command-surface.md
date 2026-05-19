# Runtime Command Surface

This reference records runtime command-surface decisions from dogfooding a real
`/ow:vision -> /ow:validation -> /ow:proto -> /ow:decision` run.

## OpenSpec Findings

OpenSpec separates what a command means from where a tool expects that command
to live:

- Command content is tool-agnostic.
- Tool adapters decide file path and frontmatter.
- OpenSpec's older Codex adapter used global prompt files, but Codex's official
  custom workflow mechanism is repo-local Skills.
- OpenWorkflow's Codex adapter should generate Skills under `.agents/skills/`.
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
- `/ow:tune` updates `.openworkflow/prototypes/` and writes internal decision audit records.
- `/ow:design` creates `.openworkflow/design/`.
- `/ow:spec` creates `.openworkflow/specs/`.

This keeps a new target repo from pretending every workflow stage already
exists.

## Codex Skill Registration

For Codex, OpenWorkflow commands should be generated as repo-local Skills:

```txt
.agents/skills/ow-vision/SKILL.md
.agents/skills/ow-validation/SKILL.md
.agents/skills/ow-proto/SKILL.md
.agents/skills/ow-tune/SKILL.md
.agents/skills/ow-design/SKILL.md
```

Each `SKILL.md` uses frontmatter:

```yaml
---
name: ow-vision
description: Create or refine the product vision contract through focused collaboration.
---
```

Each skill may include `agents/openai.yaml` for Codex App display metadata:

```yaml
interface:
  display_name: "/ow:vision"
  short_description: "Create or refine the product vision contract through focused collaboration."
  default_prompt: "Use /ow:vision for this OpenWorkflow repository."
```

The durable OpenWorkflow semantic command remains `/ow:vision`; the explicit
Codex invocation is `$ow-vision`. Codex may also expose enabled Skills in the
slash command list, but OpenWorkflow treats Skill registration as the adapter
contract.

OpenWorkflow should not generate `.codex/commands/ow/*.md`,
`.codex/skills/*`, or `$CODEX_HOME/prompts/ow-*.md` as the default Codex
surface. Generated legacy files in those locations may be safely removed when
they carry the OpenWorkflow generated marker.

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
<inner_thinking>
Private reasoning, critique, and scope checks. Do not expose chain-of-thought.
</inner_thinking>
</agent_protocol>

<user_behavior>
Ask one question at a time. Keep the visible response short.
</user_behavior>
```

## /ow:tune And Internal Decision Audit

`/ow:tune` is the user-facing prototype iteration command. `/ow:tune` and
`/ow:tune:proto` default to the current prototype. If no current prototype
exists but a current validation target exists, tune may orchestrate first
prototype creation through `/ow:proto` behavior.

`/ow:decision` remains an internal audit command. Proto and tune flows write
decision records automatically after evidence changes or user review outcomes.
Normal user-facing handoffs should point to `/ow:tune`, `/ow:design`, or
`/ow:validation`, not ask users to manually invoke `/ow:decision`.

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
