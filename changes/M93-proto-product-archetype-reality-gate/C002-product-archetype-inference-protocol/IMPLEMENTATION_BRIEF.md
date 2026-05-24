# C002 Implementation Brief

## Goal

Wire the C001 `product_experience_model` contract into the generated `/ow:proto`
and `/ow:vision2prompt` protocols.

The behavioral change is that first-pass proto generation must infer a target
product category and experience topology before strategic directions and screen
prompts are written.

## Required Protocol Concepts

- Before directions, infer product archetype and primary canvas.
- Translate VISION and validation into information architecture, domain
  objects, task loop, interaction states, data realism, visual language, and
  anti-generic constraints.
- Treat planning/incident/capacity-like items as possible modules, layers,
  workflows, or states inside one product shell, not automatically as separate
  product directions.
- Strategic directions must differ by product form or product loop, not by
  scenario labels, UI style, or governance emphasis alone.
- Negative constraints should block generic AI dashboards, report screens, and
  card walls when the product category implies a richer product shell.

## Boundaries

C002 does not add the deterministic reality gate itself; C003 owns gate fields
and validators.

C002 does not create smart city-specific fixtures; C004 owns that regression.

C002 may update generated `.agents/**` and `.openworkflow/audit/**` only through
repo-local `sync`.
