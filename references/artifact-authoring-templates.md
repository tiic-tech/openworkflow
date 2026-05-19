# Artifact Authoring Templates

M11 turns artifact contracts into authoring surfaces. A contract tells the agent
what must exist; a template tells the agent how to write it compactly.

## Template Rules

- Templates live in stage-local `_templates/` folders.
- Templates are not active workflow artifacts.
- Templates preserve recommended field order.
- Empty strings and empty arrays are intentional placeholders.
- Agents should copy a template into a new artifact folder, replace `<id>`, and
  update the relevant index.

## Read Policy

Each artifact contract declares:

- `load_by_default`: whether the agent should load this artifact after the
  command packet points to it.
- `agent_read_order`: the order in which the artifact should be loaded.
- `max_yaml_lines`: the expected upper bound for the source-of-truth YAML.
- `max_note_lines`: the expected upper bound for a human `NOTE.md`.
- `raw_evidence`: when Level 4 evidence may be opened.

These are budgets, not hard product limits. They exist to stop accidental
context expansion.

## Active Pointer Semantics

Stage indexes own the current pointer:

- `VISION_CONTRACT.yaml` owns `current_session`.
- `VALIDATION_INDEX.yaml` owns `current_validation`.
- `PROTOTYPE_INDEX.yaml` owns `current_prototype`.
- `DECISION_INDEX.yaml` owns `current_decision`.

The pointer may be `null` when no artifact exists yet. When non-null, it must
match an indexed artifact id, and the indexed artifact path must exist.

## First Consumer Workflow

An agent should resume discovery work in this order:

1. Load `.openworkflow/workflow/WORKFLOW_INDEX.yaml`.
2. Load `.openworkflow/audit/CONTEXT_PACKETS.yaml`.
3. Load `.openworkflow/audit/ARTIFACT_CONTRACTS.yaml`.
4. Load the stage index named by the command.
5. If the stage index has a current pointer, load that one YAML artifact.
6. Open `NOTE.md`, generated HTML, or raw evidence only when the YAML artifact
   explicitly points to them or human review requires it.

This makes the current artifact the default working state and keeps historical
artifacts out of context until requested.

## Prototype Evidence Shape

Prototype evidence should keep creative direction and runnable proof separate.
For `/ow:proto`, record reference analysis, static concept assets, runnable
implementation evidence, browser or screenshot verification, self-critique, and
known limits in their own fields. The generic `evidence` list may still point to
the most important files, but downstream agents should not have to infer whether
an image was a concept, a screenshot, or an implementation artifact.

When a visual prototype does not use image generation, record
`visual_concept_policy.image_generation: skipped_by_user` plus a concrete
`skip_reason`. Otherwise local `ref` values in concept, implementation,
verification, or generic evidence fields should point to existing files inside
the workflow root.

## Decision Audit

Decision records are durable audit artifacts. In normal prototype iteration,
agents should write them from `/ow:proto` or `/ow:tune` without asking the user
to invoke `/ow:decision` manually. Use `outcome: revise` when user feedback asks
for another tuning pass; reserve `needs_more_evidence` for inconclusive evidence
rather than ordinary revision requests.
