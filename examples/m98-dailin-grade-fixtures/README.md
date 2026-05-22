# M98 Dailin-Grade Prompt-Pack Fixtures

These fixtures are generated in `packages/cli/src/dev/verifyRuntimeSurface.ts`
instead of stored as YAML so repo-wide contract validation does not permanently
include intentionally invalid examples.

## Matrix

| Fixture | Expected | Purpose |
| --- | --- | --- |
| `DAILIN_GRADE_POCKET_ENGLISH_FRIEND_PROTO_PROMPT_PACK.yaml` | pass | Positive dailin-grade prompt pack with prototype brief, screen manifest, screen prompts, quality rubric, integrity gate, reality gate, and post-validation gate. |
| `THIN_IMAGE_PROMPT_D1_PROTO_PROMPT_PACK.yaml` | fail | Rejects a short image prompt that marks prompt text ready without screen-bound product states or prompt text. |
| `DIRECTION_COUNT_MISMATCH_PROTO_PROMPT_PACK.yaml` | fail | Rejects prompt packs whose manifest direction count diverges from `directions.length`. |
| `MISSING_PROMPT_REF_PROTO_PROMPT_PACK.yaml` | fail | Rejects prompt packs whose prompt refs do not resolve to known direction or prompt ids. |

The positive fixture is based on the dailin-style Pocket English Friend
pipeline: strategy first, product system before screens, concrete copy/data,
screen-bound prompts, trust controls, and readiness gates before image
generation.
