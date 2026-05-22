# M97 Product-Reality E2E Synthesis Report

Date: 2026-05-22

Repository branch: `codex/m73-workflow-blueprint-runtime-alignment`

Target dogfood repo: `/Users/archy/Projects/StartUp/smart_city_copilot`

Target dogfood branch: `codex/smart-city-product-reality-e2e`

## Executive Conclusion

M97 passes the narrow product-reality E2E boundary, but it does not yet meet the
quality bar implied by the stronger reference artifacts and dashboard video.

The repaired OpenWorkflow chain now prevents the old M92 failure mode where the
smart city prototype collapsed into a generic AI governance dashboard. It can
produce a map-first smart city operations product topology through first local
deterministic image generation.

However, the chain still falls short in two important ways:

1. The formal prompt pack artifact is not strong enough or internally complete
   enough to be the single source of truth for downstream generation.
2. The generated prototype images are product-structure evidence, not reference
   parity evidence against the dashboard video.

## What Changed In The OW Repo

The current OpenWorkflow repo changes are centered on M93 and M97:

- Product reality modeling was added to strategic prototype artifacts through
  `product_experience_model`.
- A deterministic `prototype_reality_gate` was added before image generation.
- Validators, JSON schemas, artifact registry templates, generated skill
  surfaces, and runtime verification coverage were updated for those fields.
- M93 planning/evidence artifacts were added under
  `changes/M93-proto-product-archetype-reality-gate/`.
- M97 target-repo dogfood evidence was added under
  `changes/M97-smart-city-product-reality-dogfood/`.

This commit is primarily a product-reality gate and dogfood evidence commit, not
the later prompt-pack integrity or visual-parity remediation.

## Evidence Sources

Primary target evidence:

- `/Users/archy/Projects/StartUp/smart_city_copilot/.openworkflow/vision/sessions/vision-m97/VISION_SESSION.yaml`
- `/Users/archy/Projects/StartUp/smart_city_copilot/.openworkflow/validation/val-m97/VALIDATION.yaml`
- `/Users/archy/Projects/StartUp/smart_city_copilot/.openworkflow/prototypes/proto-m97/PROTO_PROMPT_PACK.yaml`
- `/Users/archy/Projects/StartUp/smart_city_copilot/.openworkflow/prototypes/proto-m97/EVIDENCE.yaml`
- `/Users/archy/Projects/StartUp/smart_city_copilot/docs/M97_PRODUCT_REALITY_E2E_AUDIT_REPORT.md`

Reference artifacts:

- `/Users/archy/Projects/StartUp/dailin/docs/RAW_INPUT.md`
- `/Users/archy/Projects/StartUp/dailin/docs/OUTPUT_PROMPT.md`
- `/Users/archy/Projects/StartUp/dailin/docs/TUNE_PROTO_PROMPT_BY_USING_DISTILLED_PROTOTYPE_TUNE_SKILL.md`
- `/Users/archy/Projects/StartUp/dailin/docs/DISTILLED_SKILLS/`
- `/Users/archy/Downloads/Dashboard_Video.mp4`

## Artifact Quality Assessment

### Vision

Score: 8/10.

The M97 vision is strong enough to steer the chain away from generic AI
governance artifacts. It explicitly names the target product form as a
map-first smart city operations dashboard and preserves the critical loop:
selected city object, operational layers, Copilot reasoning, evidence review,
human checkpoint, and audit trace.

The gap is that the vision is still shaped like a repair-validation brief, not a
complete business/product vision. It lacks enough detail about real city
operations workflows, data source tiers, organizational roles, permission
boundaries, and demo success context.

### Validation

Score: 8/10.

The validation target is effective for the intended M97 risk: preserve smart
city product topology before image generation. It has clear central
uncertainty, must-show and must-not-show constraints, observable signals, and
decision rules.

The gap is that it validates product topology, not prompt executability or
visual reference parity. Provider-backed generation, automated visual quality,
and proto2html are explicitly out of scope, so a passing validation result must
not be interpreted as high-fidelity prototype quality.

### Prompt Set

Score: 6/10.

The prompt set contains the new `product_experience_model` and a passing
`prototype_reality_gate`, but it does not yet match the dailin benchmark.

Critical finding: the formal `PROTO_PROMPT_PACK.yaml` is too thin and appears
internally incomplete for downstream consumption. It advertises three
directions, but the formal YAML direction list is not as complete as the richer
D1-D3 content later found in `EVIDENCE.yaml`. This means downstream agents may
consume the wrong source or receive insufficient screen-level instructions.

The dailin benchmark shows the expected bar: direction map, product system,
complete screen groups, interaction states, component vocabulary, trust
boundaries, global design prompt, screen-specific prompts, negative prompts, and
acceptance checks. M97 has some of this information, but it is not consistently
located in the prompt pack source artifact.

## Prototype Quality Assessment

Overall score against `/Users/archy/Downloads/Dashboard_Video.mp4`: 4/10.

M97 is directionally correct but cannot yet rival the reference dashboard
experience.

The current D1/D2/D3 images prove product topology:

- D1: planning approval selected parcel.
- D2: incident response selected alert.
- D3: asset capacity selected cluster.

Each image uses a map-first shell with a left rail, central map, selected object,
right drawer, HIL controls, and audit trace.

The reference video is stronger because it is a continuous operational
experience:

- stable smart city dashboard shell
- real map substrate
- expandable domain/layer navigation
- selected object popovers
- right-side business detail drawer
- object-level data density
- state progression across time
- transition from operator dashboard to citizen-facing booking/action

M97 has the shell, but not the operational depth, real map density, object data
model, or motion/storyboard continuity.

## Key Gaps

### P0: Prompt Pack Integrity

The prompt pack must become the single trusted source for downstream generation.
OpenWorkflow should prevent a state where `prompt_text_manifest.direction_count`
and the actual `directions` content diverge, or where `EVIDENCE.yaml` references
directions that are absent or incomplete in the prompt pack.

Minimum remediation:

- add `prompt_pack_integrity_gate`
- enforce `direction_count == len(directions)`
- enforce stable direction IDs and source prompt refs
- require every direction to include screen-bound prompts
- make summary/handoff expose prompt-pack integrity failures

### P0: Prompt Executability

The prompt compiler should output dailin-style prompt packs:

- Direction Map
- Global Design System Prompt
- Screen-Specific Prompts
- required components
- interaction states
- example content and copy
- data fields
- negative prompts
- acceptance checklist

The current product reality gate proves category fit; it does not prove that
the prompt is executable enough for high-fidelity generation.

### P0: Visual Reality And Reference Parity

OpenWorkflow needs separate statuses for:

- product topology pass
- visual reality pass
- reference parity pass

M97 should be recorded as topology pass, but reference parity not yet passed.

### P1: Storyboard And Motion Modeling

The reference video is a state progression, not a static screen set. OW needs a
storyboard/motion artifact or fields such as:

- frame_id
- timestamp
- driver
- state_delta
- active layer
- selected object
- drawer state
- transition
- visible data objects

Without this, `vision -> proto` will continue to produce static terminal states
instead of demo-grade experiences.

### P1: Data Object Contracts

The product experience model should compile into domain-specific data contracts:

- city domain taxonomy
- layer state model
- selected object detail schema
- metric fields
- owner/status/timestamp fields
- evidence and audit fields
- action/CTA rules

For smart city dashboards, object realism is not optional. It is the main proof
that the screen is an operations product rather than a decorative map.

### P2: Provider And Deterministic Evidence Separation

The deterministic SVG/PNG batch is useful for local contract verification, but
it should not be treated as proof of provider-backed image quality. Evidence
types should remain explicit.

## Recommended Repair Plan

1. Add prompt-pack integrity validation.
   This is the first fix because it protects downstream agents from consuming
   incomplete or contradictory prompt packs.

2. Upgrade the strategic prompt-pack schema and protocol to dailin-level
   screen-bound output.
   This should include global design prompt, screen manifest, per-screen prompt,
   data fields, states, interactions, and acceptance checks.

3. Add visual/reality review artifacts.
   A `VISUAL_REVIEW.yaml` or equivalent should score map realism, data density,
   drawer anatomy, interaction affordance, readability, and reference parity.

4. Add storyboard/motion modeling.
   This is required before OW can target video-like dashboard experiences rather
   than static screen sets.

5. Add reference-pattern ingestion.
   A reference artifact should preserve Evidence, Inference, and Transfer
   findings from benchmark videos or image sets, then feed validation and prompt
   generation.

## Current Test Status

Target repo M97 handoff remains intentionally inside prototype flow:

- `validate`: pass
- `summaries --strict`: pass
- `handoff`: pass
- target `next_command`: `/ow:tune`

OW repo validation:

- `node dist/cli/src/index.js validate --root . --json`: pass

## Final Recommendation

Treat M97 as a successful second pressure test for product-reality direction
repair, not as a final high-fidelity prototype-generation success.

The next OpenWorkflow repair work should start with prompt-pack integrity and
executability before attempting reference-parity visual generation.
