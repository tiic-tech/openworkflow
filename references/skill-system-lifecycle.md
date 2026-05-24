# Skill System Lifecycle

This reference defines OpenWorkflow's native skill format and lifecycle. It is
the read-first contract for future changes that edit skill generation, adapter
delivery, generated-surface validation, or runtime command exposure.

## Format Contract

An OpenWorkflow runtime skill is a Markdown skill file with YAML frontmatter and
XML-like semantic blocks. It is not a full XML document and must not be wrapped
in a top-level `<skill>` element.

Current generated Codex runtime skills follow this shape:

```md
---
name: "ow-proto"
description: "Create image-first strategic prototype prompt packs..."
---
<!-- generated-by: openworkflow; adapter: codex; adapter-version: 0.1.0; template-id: codex.skill.ow.proto -->
# /ow:proto

<user_behavior>
...
</user_behavior>

<agent_protocol>
...
</agent_protocol>

<codex_skill>
...
</codex_skill>
```

The frontmatter is for agent discovery. The Markdown heading and prose are for
human and agent readability. The XML-like blocks are for stable agent protocol
boundaries.

## Frontmatter Policy

Required fields for generated runtime skills:

- `name`: the repo-local skill name, such as `ow-proto`
- `description`: short invocation guidance for the target agent platform
- `metadata`: generated identity fields, including generator name, adapter id,
  adapter version, template id, source command id, semantic trigger, and skill
  name

Source skills under `skills/` may use their own frontmatter as required by the
skill authoring system, but source skills are not runtime `/ow:*` surfaces until
they are registered and generated through an adapter.

The generated marker remains the ownership signal used by sync and cleanup.
Structured metadata gives validators and agents a queryable identity layer, but
it does not replace the generated marker.

## Protocol Blocks

OpenWorkflow uses XML-like blocks because they give agents low-context,
machine-locatable boundaries inside otherwise readable Markdown.

The block taxonomy is:

- `<user_behavior>`: visible-response behavior and interaction style for the command.
- `<agent_protocol>`: private command protocol. Agents must not quote or expose this block as routine output.
- `<source_of_truth>`: durable state root, currently `.openworkflow/`.
- `<stage>` and `<command_visibility>`: lifecycle stage and user/internal command visibility.
- `<interaction_mode>`: command-specific mode, such as conversation-first or image-first.
- `<inner_thinking>`: private reasoning guardrails. This block authorizes private classification and scope checks, not disclosure of chain of thought.
- `<required_context>`: files or indexes that must be loaded before acting.
- `<optional_context>`: files that may be loaded only when summaries or required context are insufficient.
- `<forbidden_context>`: paths that should not be loaded for this command.
- `<allowed_outputs>`: durable outputs the command may create or update.
- `<conditional_outputs>`: outputs allowed only under named conditions.
- `<artifact_contracts>`: compact artifact contracts relevant to the command.
- `<forbidden_outputs>`: outputs the command must not create.
- `<audit_checkpoints>`: before, during, and after checks that keep the workflow trustworthy.
- `<working_protocol>`: common execution rules for loading, acting, and narrowing scope.
- `<artifact_checkpoint>`: rules for when durable artifact writes are appropriate.
- `<anti_patterns>`: known behavior that should be rejected.
- `<handoff>` and `<handoff_commands>`: readiness and next-command boundaries.
- `<codex_skill>`: Codex adapter metadata that links the generated skill to the semantic command.

Blocks may contain Markdown lists or short prose. They are XML-like delimiters,
not an XML schema. Block contents should still escape literal `<`, `>`, and `&`
where generated content needs to be rendered inside another XML-like block.

## Lifecycle

The source-of-truth chain is:

1. `packages/core/src/commands/registry.ts` defines semantic `/ow:*` commands,
   stages, visibility, target artifacts, and command protocols.
2. `packages/core/src/artifacts/registry.ts` defines discovery artifact
   contracts consumed by command generation and audit outputs.
3. Adapter generators, currently under `packages/adapters/codex/src/`, render
   repo-local runtime surfaces.
4. `openworkflow init` and `openworkflow sync` write generated surfaces.
5. Generated files are committed only after source changes and sync or init have
   produced them.

Generated Codex surfaces include:

- `.agents/skills/ow-*/SKILL.md`
- `.agents/skills/ow-*/agents/openai.yaml`
- `.agents/openworkflow-adapter.yaml`
- `.openworkflow/audit/*`
- `AGENTS.md` managed content when onboarding guidance changes

Do not hand-edit generated surfaces to change product behavior. Update command
registries, artifact registries, adapter templates, schemas, validators, or
source skills, then regenerate.

## Repo-Local Delivery

OpenWorkflow's default delivery is repo-local. Runtime skills live with the
repository so agents can consume the same workflow contract as the codebase.

OpenSpec's global Codex prompt installation model is useful as a reference for
adapter abstraction, but it is not the default OpenWorkflow model. OpenWorkflow
should not move `/ow:*` behavior into user-home prompt files because that would
weaken reproducibility, reviewability, and repository auditability.

Future adapter work may introduce delivery metadata such as skill-only,
command-only, or both. That metadata must keep repo-local delivery as the
default unless a future change explicitly accepts a different trust model.

## Relationship To OpenSpec

The OpenSpec research produced useful lifecycle lessons:

- Template source and generated skill files should be separated.
- A central registry should list skills, command ids, directory names, and
  delivery targets.
- Adapter-specific path and frontmatter rules should live behind adapter
  boundaries.
- Generated files should carry version or generated metadata that supports
  drift detection.
- Profile or delivery concepts can separate "which workflows exist" from "how
  they are installed."

OpenWorkflow should not copy these parts directly:

- Markdown-only runtime skill protocols are too weak for OW's artifact and
  handoff boundaries.
- Global Codex prompt installation does not match OW's repo-local audit model.
- File-existence-only drift checks are weaker than OW's command, artifact, and
  audit contracts.
- Hardcoding all protocol text in one template layer would make artifact
  contracts secondary; OW should keep command and artifact registries as the
  primary source.

## Static Skills And Dynamic Instructions

Runtime skills are static command contracts. They tell the agent what command
means, what context to load, what outputs are allowed, and when to hand off.

Dynamic artifact instructions are a separate possible layer. The design contract
is in `references/artifact-instruction-envelope.md`. If OW later adds an
OpenSpec-like instruction envelope, it should be generated for a specific
artifact or selected task and may use tags such as `<task>`, `<context>`,
`<rules>`, `<dependencies>`, `<output>`, `<template>`, and
`<success_criteria>`.

Dynamic instruction envelopes must never be copied into produced artifacts
unless the artifact contract explicitly asks for them. They are constraints for
the agent, not user-facing artifact content.

## Drift And Validation Expectations

Future validation should be able to answer:

- Does every registered runtime command have the expected generated skill?
- Does every generated skill identify its command, adapter, and template?
- Do generated skills contain required frontmatter and protocol blocks?
- Do generated audit indexes match command and artifact registries?
- Does sync reproduce generated surfaces without manual patching?

Until structured generated metadata is added, the generated marker remains the
minimum ownership signal. Changes that touch runtime skills, adapter output, or
audit indexes should run repository validation and runtime-surface verification
when those commands are in scope.

## Change Boundaries

Use this reference before selecting or implementing changes that touch:

- skill generation
- command registry exposure
- artifact contract registration
- adapter delivery
- generated-surface validation
- `.agents/**`
- `.openworkflow/audit/**`

Small documentation or source-skill changes do not need to regenerate runtime
surfaces unless they change the registered command or adapter output.
