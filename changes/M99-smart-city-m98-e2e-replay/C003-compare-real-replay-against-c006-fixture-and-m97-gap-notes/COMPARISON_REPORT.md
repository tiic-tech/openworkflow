# C003 Comparison Report

## Sources

- Target replay: `/tmp/smart-city-m99-e2e-worktree/.openworkflow/prototypes/proto-001/PROTO_PROMPT_PACK.yaml`
- Target commit: `9a609cf901217cd1324e589459c90dfcddbad687`
- M98 C006 fixture: `examples/m98-smart-city-replay/PROTO_PROMPT_PACK.yaml`
- M97 gap notes: `docs/M97_PRODUCT_REALITY_E2E_SYNTHESIS_REPORT.md`
- Dailin prompt quality reference: `/Users/archy/Projects/StartUp/dailin/docs/OUTPUT_PROMPT.md`

## Verdict

The real target replay is source-complete for the M98 prompt-pack contract.

Do not route back to `/ow:vision2prompt` for a source-completeness repair. The
next product workflow should proceed to a separate visual reference parity gate,
with storyboard/motion modeling kept as its own follow-up.

## Target Vs C006 Fixture

Both the target replay and the C006 fixture include the required M98 source
fields:

- `prototype_brief`
- `product_experience_model`
- `screen_manifest`
- `global_design_system_prompt`
- `directions[].screen_prompts`
- screen-level `negative_prompt`
- screen-level `example_copy`
- `quality_rubric`
- `prompt_pack_integrity_gate`
- `prototype_reality_gate`
- `image_generation.status: not_started`

Both model the same product topology: one map-first smart city operations shell
with planning, incident, and capacity represented as states or modules rather
than unrelated scenario slides.

The target replay is a real target-repo artifact, so it is stronger evidence
than the stored fixture for handoff trust. It uses the target vision and
validation artifacts, passes target `validate`, passes target strict summaries,
and target `handoff` reports trusted quality.

## M97 Gap Check

M97's P0 source gap was that important D1-D3 prompt detail lived downstream in
`EVIDENCE.yaml` instead of being consistently available in the formal
`PROTO_PROMPT_PACK.yaml`.

C002 resolves that gap in the real target repo. The target prompt pack now
carries product brief, product experience model, map-first shell, planning
review, incident response, capacity monitor, concrete screen prompts, negative
prompts, quality rubric, integrity gate, and reality gate in the prompt-pack
source before image generation.

This does not prove visual reference parity. It only proves prompt-pack source
completeness and prompt executability.

## Dailin Prompt Quality Check

`StartUp/dailin/docs/OUTPUT_PROMPT.md` sets a higher qualitative bar than
field presence. It asks for:

- complete user journeys or flows;
- multiple screens grouped around one coherent product hypothesis;
- specific screen content, copy, state, and controls;
- negative constraints that prevent wrong product categories;
- interaction and rescue states;
- memory/privacy/trust boundaries;
- clear target-user feeling and success criteria.

The target replay now matches the dailin bar on the parts that belong to M98:

- coherent product hypothesis;
- screen-bound product states;
- concrete components, data fields, actions, copy, and trust controls;
- negative visual patterns;
- explicit non-goals and privacy/trust boundaries;
- direct generatability without downstream invention.

The target replay is still thinner than dailin in one intentional way: dailin
prompts describe a fuller end-to-end product journey with more screens and
interaction progression. For smart city, that remaining richness maps to the
deferred storyboard/motion and visual reference parity queues, not to a missing
M98 prompt-pack source-completeness field.

## Recommendation

Proceed to a dedicated visual reference parity gate.

Do not repair `/ow:vision2prompt` for source completeness based on C003. If a
future queue wants dailin-style full journey richness for smart city, it should
be framed as storyboard/motion or reference-pattern work, not as a bug in the
M98 prompt-pack source contract.
