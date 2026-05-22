# Output Boundary

Use this reference to keep `build-proto-prompt` from crossing into downstream
prototype consumption.

## Owns

- strategic prompt-pack compilation;
- product experience model extraction;
- prototype system coherence contract;
- direction and screen prompt text;
- prompt-pack readiness gates;
- review plan for prompt evidence;
- handoff facts for `prompt2proto`.

## Does Not Own

- provider image generation;
- UI/UX visual translation from ready prompt packs;
- density calibration after prompt-pack readiness;
- human visual review;
- visual reference parity;
- proto2html;
- storyboard or motion;
- production specs, changes, teams, or runtime state.

## Handoff Contract

When ready:

```yaml
prompt_text_manifest:
  status: ready_for_image_generation
  paragraph_quality_status: pass
prototype_system_contract:
  stable_app_shell:
    - persistent product frame is defined
  allowed_screen_deltas:
    - state-specific changes are explicit
image_generation:
  status: not_started
internal_pipeline:
  next_stage: prompt2proto
```

When blocked:

```yaml
prompt_text_manifest:
  status: blocked
image_generation:
  status: not_started
repair_route: /ow:build-proto-prompt
```
