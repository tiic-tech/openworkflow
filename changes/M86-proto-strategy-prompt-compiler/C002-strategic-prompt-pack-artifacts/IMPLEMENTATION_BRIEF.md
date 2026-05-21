# C002 Implementation Brief

Strengthen the strategic prototype prompt-pack artifact shape so `/ow:proto`
cannot produce a thin or ephemeral prompt pack after M85.

The artifact must also absorb the important behaviors from the
`vision_to_strategic_prototype_prompt` reference skill:

- verify vision and validation artifact existence and quality before prompt work;
- route back to `/ow:vision` when the artifacts are not strong enough for
  high-quality prototype prompts;
- represent `askUserQuestion` when the user has not specified the number of
  strategic directions;
- default to 3 directions only when the user delegates that decision to the
  agent;
- write multi-direction, multi-image prompt text before image generation;
- record image generation batch status and collected outputs separately from
  prompt text readiness.

Implementation should update schemas, templates, validators, summary quality,
and verification. Generated `.openworkflow/audit/ARTIFACT_CONTRACTS.yaml` may
change only through `openworkflow sync`.

Do not implement `/ow:tune`, generated images, HTML, proto2html, or runtime
execution in this change.
