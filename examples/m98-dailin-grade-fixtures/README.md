# M98 Dailin-Grade Prompt-Pack Fixtures

These fixtures are generated in `packages/cli/src/dev/verifyRuntimeSurface.ts`
instead of stored as YAML so repo-wide contract validation does not permanently
include intentionally invalid examples.

## Matrix

| Fixture | Expected | Purpose |
| --- | --- | --- |
| `DAILIN_GRADE_POCKET_ENGLISH_FRIEND_PROTO_PROMPT_PACK.yaml` | pass | Positive dailin-grade prompt pack with prototype brief, screen manifest, screen prompts, quality rubric, integrity gate, reality gate, and post-validation gate. |
| `examples/m98-smart-city-replay/PROTO_PROMPT_PACK.yaml` | pass | C006 replay that proves the smart city prompt pack source carries the product brief, screens, prompts, negative prompts, rubric, and gates before image generation. |
| `THIN_IMAGE_PROMPT_D1_PROTO_PROMPT_PACK.yaml` | fail | Rejects a short image prompt that marks prompt text ready without screen-bound product states or prompt text. |
| `DIRECTION_COUNT_MISMATCH_PROTO_PROMPT_PACK.yaml` | fail | Rejects prompt packs whose manifest direction count diverges from `directions.length`. |
| `MISSING_PROMPT_REF_PROTO_PROMPT_PACK.yaml` | fail | Rejects prompt packs whose prompt refs do not resolve to known direction or prompt ids. |

The positive fixture is based on the dailin-style Pocket English Friend
pipeline: strategy first, product system before screens, concrete copy/data,
screen-bound prompts, trust controls, and readiness gates before image
generation.

The smart city replay fixture is stored as a real example because C006 is about
source completeness rather than negative validation. Runtime verification reads
that YAML, checks its structure, copies it into a temporary OpenWorkflow
prototype directory, and validates it through the repo dist CLI.
