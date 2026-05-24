# M98 Dailin-Grade Prompt-Pack Fixtures

These fixtures are generated in `packages/cli/src/dev/verifyRuntimeSurface.ts`
instead of stored as YAML so repo-wide contract validation does not permanently
include intentionally invalid examples.

## Matrix

| Fixture | Expected | Purpose |
| --- | --- | --- |
| `DAILIN_GRADE_POCKET_ENGLISH_FRIEND_PROTO_PROMPT_PACK.yaml` | pass | Positive dailin-grade prompt pack with prototype brief, screen manifest, screen prompts, quality rubric, integrity gate, reality gate, and post-validation gate. |
| `SMART_CITY_MAP_FIRST_PROTO_PROMPT_PACK.yaml` | pass | Positive smart city prompt pack with map-first product reality and dailin-grade long-form prompt paragraph quality. |
| `examples/m98-smart-city-replay/PROTO_PROMPT_PACK.yaml` | fail | Stored M98 replay remains source-complete but intentionally fails the M100 paragraph-quality bar because its screen prompts are still too terse. |
| `TERSE_SCREEN_STATE_PROMPT_PROTO_PROMPT_PACK.yaml` | fail | Rejects M99-style screen-state prompt text such as "Show the same map shell..." when it lacks journey, system response, trust controls, and user feeling. |
| `LONG_BUT_STRATEGYLESS_PROTO_PROMPT_PACK.yaml` | fail | Rejects verbose prompt text when the pack skips strategic core or build recommendation structure required by the dailin workflow. |
| `THIN_IMAGE_PROMPT_D1_PROTO_PROMPT_PACK.yaml` | fail | Rejects a short image prompt that marks prompt text ready without screen-bound product states or prompt text. |
| `DIRECTION_COUNT_MISMATCH_PROTO_PROMPT_PACK.yaml` | fail | Rejects prompt packs whose manifest direction count diverges from `directions.length`. |
| `MISSING_PROMPT_REF_PROTO_PROMPT_PACK.yaml` | fail | Rejects prompt packs whose prompt refs do not resolve to known direction or prompt ids. |

The positive fixture is based on the dailin-style Pocket English Friend
pipeline: strategy first, product system before screens, concrete copy/data,
screen-bound prompts, trust controls, and readiness gates before image
generation.

The stored smart city replay fixture remains useful because it proves the M98
source-completeness win while now also preserving the M100 failure mode: source
complete YAML is not enough when `screen_prompts[].prompt` reads like a terse
screen-state instruction. Runtime verification pairs that negative with a
generated smart city positive fixture that demonstrates the new paragraph bar.
