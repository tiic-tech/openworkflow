# C001 Implementation Brief

## Goal

Define the native OW artifact contract for a `product_experience_model` inside
first-pass strategic prototype prompt packs.

The model exists to prevent `/ow:vision2prompt` from generating prompt packs
that are valid YAML but product-invalid: generic AI dashboards, report screens,
or scenario lists that do not express the target product category.

## Required Contract Concepts

- Product archetype, for example `map-first smart city operations dashboard`.
- Primary canvas, for example map, call console, workspace, inbox, playground,
  board, timeline, or editor.
- Information architecture and navigation model.
- Domain object model with concrete user-visible objects.
- Primary product loop or task flow.
- Interaction state model: selected, expanded, empty, loading, warning,
  blocked, pending human confirmation, and similar category-relevant states.
- Data realism requirements: concrete sample fields, metrics, labels, and
  operational values.
- Visual language derived from the product category.
- Anti-generic constraints that prevent AI governance/report/card-wall drift.

## Boundaries

Do not update generated `/ow:proto` or `/ow:vision2prompt` skill guidance in
this change; C002 owns generated protocol wiring.

Do not add image generation, external visual review, provider integration,
proto2html, or smart city fixture assertions in this change.

Do not edit generated `.agents/**` or `.openworkflow/audit/**` surfaces in C001.
