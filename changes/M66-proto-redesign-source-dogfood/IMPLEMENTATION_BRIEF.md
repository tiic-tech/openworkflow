# M66 Implementation Brief

Dogfood the redesigned source-level `/ow:proto` behavior on OpenWorkflow's own
vision.

This change should produce planning artifacts only:

- `PROTO_PROMPT_PACK.yaml`
- `PROTO_PROMPT_PACK.md`
- `REVIEW_PLAN.md`
- `EVIDENCE.md`

The dogfood run uses vision-only input because no dedicated validation artifact
is present for this proto redesign. It must record that explicitly rather than
pretending validation has already happened.

The output should recommend one first generation direction and identify what a
future `/ow:tune` pass should preserve or adjust. Runtime exposure, generated
adapter surfaces, HTML conversion, and production implementation are out of
scope.
