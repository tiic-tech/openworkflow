# 04 Output Contract

Use this reference when writing prompt2proto evidence or translation artifacts.

## Translation Plan

`PROMPT2PROTO_TRANSLATION_PLAN.md` should include:

- source prompt pack path and readiness status;
- role-engine summary;
- selected directions and screen ids;
- prototype system constants;
- per-screen UI/UX translation instructions;
- density decisions;
- trust and approval surfaces;
- negative constraints;
- known limits and next handoff.

## Evidence YAML

`PROMPT2PROTO_EVIDENCE.yaml` should be provider-agnostic:

```yaml
schema_version: 0.1.0
artifact_type: prompt2proto_evidence
status: ready_for_generation|blocked
source_prompt_pack: path
role_engine:
  chief_pm: applied
  principal_ui_ux: applied
readiness:
  status: pass|blocked
  blockers: []
translation_outputs:
  plan: PROMPT2PROTO_TRANSLATION_PLAN.md
  selected_directions: []
  selected_screen_ids: []
prototype_system:
  coherence_contract_status: present|missing|not_required
  stable_elements: []
density_calibration:
  visible: []
  grouped: []
  collapsed: []
  delayed: []
handoff:
  next_allowed_stage: provider_generation|prompt_pack_repair|review_blocked
  forbidden_claims: []
```

## Future Image Metadata

When a later queue authorizes provider generation, every generated image must
record:

- `image_id`
- `direction_id`
- `prompt_id`
- `screen_name`
- `path`
- `source_prompt_ref`
- `generated_at`
- `generator`
- `generation_status`
- `review_status`

Images without metadata are not valid prototype evidence.
