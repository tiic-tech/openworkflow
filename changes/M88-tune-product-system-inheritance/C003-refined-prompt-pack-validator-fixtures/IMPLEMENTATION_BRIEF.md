# C003 Implementation Brief

## Goal

Pressure-test `refined_proto_prompt_pack` validation for `/ow:tune` artifacts.
The fixtures should prove that downstream agents receive a complete,
screen-bound refined prompt pack instead of a loose set of prompts.

## Fixture Matrix

- Valid refined prompt pack passes.
- Missing `baseline_audit` fails.
- `screen_prompts.target_screen_id` not present in `screen_manifest` fails.
- Missing required inheritance/removal rules fails when a tune request asks for
  changes.

## Boundaries

Use local runtime validation fixtures only. Do not generate prototype images,
add browser visual review, or touch async runtime behavior.
