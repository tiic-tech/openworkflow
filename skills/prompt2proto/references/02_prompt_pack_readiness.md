# 02 Prompt Pack Readiness

Use this reference to check that the prompt pack can be translated without
inventing missing strategy or screen system rules.

## Readiness Checks

Verify:

- all required gates from `01_input_contract.md` pass;
- `directions[].id` and `screen_prompts[].target_screen_id` resolve;
- every screen prompt is standalone enough for a visual prototype stage;
- screen prompts carry journey stage, interaction behavior, system response,
  trust controls, anti-goals, visual direction, desired user feeling, and
  concrete content;
- product thesis, target user, primary loop, trust boundaries, and non-goals
  are consistent across YAML and Markdown views.

## Coherence Checks

For multi-screen groups, identify the stable prototype system:

- app shell and navigation taxonomy;
- primary canvas and layout grid;
- domain object vocabulary;
- object drawer or detail panel anatomy;
- action bar and command patterns;
- audit, provenance, approval, privacy, or safety controls;
- copy tone and data formatting;
- allowed screen-specific state deltas.

If the prompt pack lacks coherence constraints needed for multiple screens,
record a blocker. Do not invent the contract downstream.

## Handoff Shape

Produce a concise readiness summary:

```yaml
prompt2proto_readiness:
  status: pass|blocked
  accepted_prompt_pack: path
  selected_directions: []
  selected_screen_ids: []
  coherence_contract_status: present|missing|not_required
  blockers: []
  repair_route: build-proto-prompt
```
