# C003 Implementation Brief

Upgrade generated `/ow:proto` behavior so it actually follows the
`vision_to_strategic_prototype_prompt` method within OW's artifact model.

Required protocol:

- validate vision and validation artifact existence and quality before prompt
  work;
- route insufficient vision or validation quality back to `/ow:vision` with
  focused follow-up questions;
- ask the user how many strategically different prototype directions to
  generate when the number is absent;
- use `3` only when the user delegates the direction-count decision to the
  agent;
- generate and persist all multi-direction, multi-image prompt text before
  image generation;
- batch-generate prototype images only after prompt text is ready;
- collect generated image paths and notes into `EVIDENCE.yaml`.

Do not add tune behavior, proto2html, HTML generation, specs, changes, or
runtime execution beyond generated command guidance.
