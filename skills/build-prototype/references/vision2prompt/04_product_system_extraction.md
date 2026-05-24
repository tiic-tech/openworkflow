# 04 Product System Extraction

Use this reference before writing screen prompts. A dailin-grade prompt pack is
a product prototype brief, not a single image description.

## Dailin Workflow Mapping

This OW-only step extends the dailin workflow between dailin Step 4, "Select N
Directions", and Step 5, "Write Each Prototype Prompt". Dailin's prompts work
because they describe a full product system: first-time setup, home, primary
interaction surface, correction or system-response moment, memory/trust
controls, recap, and follow-up. OW must make that product system explicit
before writing paragraph prompts.

For operations, workflow, dashboard, editor, map, inbox, or AI-mediated
products, extract the equivalent system shell and journey stages. Do not jump
from strategy directly to isolated screenshot prompts.

## Product Experience Model

Populate `product_experience_model` before selecting or finalizing directions:

- `product_archetype`: category such as map-first dashboard, voice call ritual,
  companion room, scenario playground, inbox, workspace, board, editor, console,
  journal, or operations command center.
- `primary_canvas`: the surface that should dominate the prototype, such as
  map, call console, conversation room, timeline, board, editor, dashboard, or
  object detail workspace.
- `information_architecture`: navigation, hierarchy, product areas, and major
  domains.
- `domain_object_model`: concrete user-visible objects, records, entities,
  files, memories, tasks, incidents, assets, messages, or business data.
- `primary_task_loop`: the end-to-end workflow the prototype must make legible.
- `interaction_state_model`: selected, expanded, empty, loading, warning,
  blocked, permissioned, pending human confirmation, stuck, rescued, saved,
  edited, or deleted states.
- `data_realism_requirements`: sample fields, labels, metrics, values, copy,
  timestamps, owners, statuses, and domain-specific examples.
- `visual_language`: category-specific layout and component expectations.
- `anti_generic_constraints`: patterns that would make the prototype false to
  the product category.

## Screen Group Manifest

Derive a `screen_manifest` before writing final prompts. Each screen should
carry:

- `screen_id`
- `screen_name`
- `journey_stage`
- `user_goal`
- `system_state`
- `selected_object` when relevant
- `required_components`
- `required_data_fields`
- `primary_actions`
- `ai_behavior` or explicit non-AI rationale
- `trust_controls`
- `example_copy`
- `acceptance_criteria`

If the product is a continuous workflow, screens should be state progression,
not unrelated scenario slides.

## Direction Versus Scenario Test

A scenario is a direction only if it changes product form, trigger, interaction
model, emotional driver, retention mechanism, validation metric, or main risk.

Otherwise, model the scenario as a screen, module, layer, state, or object type
inside one product shell.

## Product Specificity Rule

Every prompt pack must contain concrete domain objects and example content.
Words like dashboard, metrics, AI, workflow, recommendation, memory, or coach
are insufficient unless the artifact names the actual objects, fields, states,
actions, and system behavior.
