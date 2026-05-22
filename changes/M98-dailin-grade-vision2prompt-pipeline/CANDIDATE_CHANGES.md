# M98 Dailin-Grade Vision2Prompt Pipeline

Source of truth: `CANDIDATE_CHANGES.yaml`

Status: active

Branch boundary: `codex/m98-dailin-grade-vision2prompt-pipeline`

## Scope

Upgrade `/ow:vision2prompt` from thin image-prompt generation into an
OW-native, dailin-grade prompt-pack compiler. The queue owns prompt-pack
integrity, screen-bound executability, reference pipeline migration, generated
protocol wiring, fixtures, and a smart city replay.

This queue does not own provider-backed image generation, automated visual
quality review, storyboard/motion modeling, reference-pattern ingestion, or
proto2html.

## Selection Policy

Completed candidate: `C001`

Completed candidate: `C002`

Completed candidate: `C003`

Select the first dependency-free candidate that most reduces downstream
prompt-pack ambiguity. Stop for a high-risk decision report if a candidate
expands beyond `/ow:vision2prompt` prompt-pack behavior into broad workflow
semantics, release publishing, or remote-impacting changes.

## Candidates

| ID | Status | Risk | Title | Dependencies |
| --- | --- | --- | --- | --- |
| C001 | done | medium | Add prompt-pack integrity gate | none |
| C002 | done | medium | Migrate dailin reference pipeline into OW vision2prompt references | none |
| C003 | done | medium | Extend strategic prompt-pack contract for screen-bound executability | C001, C002 |
| C004 | candidate | medium | Wire dailin-grade pipeline into generated vision2prompt protocol | C002, C003 |
| C005 | candidate | medium | Add dailin-grade prompt-pack fixtures and thin-prompt regressions | C001, C002, C003, C004 |
| C006 | candidate | medium | Replay smart city prompt pack with dailin-grade contract | C003, C004, C005 |

## Next Recommendation

`C001` is complete. The M97 failure mode is not only weak wording; it is that
downstream generation could proceed from a prompt pack whose manifest,
directions, and evidence refs diverged. Integrity now fails closed before the
richer dailin-style structure is added.

`C003` is complete. `C004` is now the next candidate because generated
`/ow:vision2prompt` protocol guidance can reference stable integrity and
screen-bound executability contract fields.

## Deferred

- `M99-prototype-visual-reference-parity-gate`
- `M100-prototype-storyboard-motion-model`
- `M101-reference-pattern-ingestion`
- `M95-provider-image-generation-benchmark`
- `M91-proto2html-benchmark-input`

## Candidate Details

### C001 - Add Prompt-Pack Integrity Gate

Purpose: make `PROTO_PROMPT_PACK.yaml` the single trusted source for downstream
generation by rejecting direction-count drift, missing prompt refs, and evidence
that references absent or incomplete directions.

Selected change artifacts:

- `changes/M98-dailin-grade-vision2prompt-pipeline/C001-prompt-pack-integrity-gate/SELECTED_CHANGE.yaml`
- `changes/M98-dailin-grade-vision2prompt-pipeline/C001-prompt-pack-integrity-gate/ATOM_TASKS.yaml`
- `changes/M98-dailin-grade-vision2prompt-pipeline/C001-prompt-pack-integrity-gate/IMPLEMENTATION_BRIEF.md`
- `changes/M98-dailin-grade-vision2prompt-pipeline/C001-prompt-pack-integrity-gate/LOCAL_CHANGE_EVIDENCE.yaml`

Validation:

- `npm run build`
- `npm run validate`
- `npm run verify:runtime-surface`
- `node dist/cli/src/index.js validate --root . --json`

### C002 - Migrate Dailin Reference Pipeline Into OW Vision2Prompt References

Purpose: bring the proven dailin `vision_to_strategic_prototype_prompt` method
into OpenWorkflow as OW-owned references that agents must execute before writing
strategic prompt packs.

Selected change artifacts:

- `changes/M98-dailin-grade-vision2prompt-pipeline/C002-dailin-reference-pipeline/SELECTED_CHANGE.yaml`
- `changes/M98-dailin-grade-vision2prompt-pipeline/C002-dailin-reference-pipeline/ATOM_TASKS.yaml`
- `changes/M98-dailin-grade-vision2prompt-pipeline/C002-dailin-reference-pipeline/IMPLEMENTATION_BRIEF.md`
- `changes/M98-dailin-grade-vision2prompt-pipeline/C002-dailin-reference-pipeline/LOCAL_CHANGE_EVIDENCE.yaml`

Validation:

- `npm run build`
- `npm run validate`
- `rg -n "vision2prompt|dailin-grade|screen_manifest|quality_rubric" skills/build-prototype/references`

### C003 - Extend Strategic Prompt-Pack Contract For Screen-Bound Executability

Purpose: expand `PROTO_PROMPT_PACK` so dailin-grade product prototype
instructions are structured in YAML, not hidden only in prose or downstream
evidence.

Selected change artifacts:

- `changes/M98-dailin-grade-vision2prompt-pipeline/C003-screen-bound-executability-contract/SELECTED_CHANGE.yaml`
- `changes/M98-dailin-grade-vision2prompt-pipeline/C003-screen-bound-executability-contract/ATOM_TASKS.yaml`
- `changes/M98-dailin-grade-vision2prompt-pipeline/C003-screen-bound-executability-contract/IMPLEMENTATION_BRIEF.md`
- `changes/M98-dailin-grade-vision2prompt-pipeline/C003-screen-bound-executability-contract/LOCAL_CHANGE_EVIDENCE.yaml`

Validation:

- `npm run build`
- `npm run validate`
- `npm run verify:runtime-surface`
- `node dist/cli/src/index.js validate --root . --json`
- `node dist/cli/src/index.js summaries --root . --strict --json`

### C004 - Wire Dailin-Grade Pipeline Into Generated Vision2Prompt Protocol

Purpose: make generated `/ow:vision2prompt` guidance execute the OW reference
pipeline and block handoff to `/ow:prompt2proto` until prompt-pack integrity and
executability gates pass.

Validation:

- `npm run build`
- `node dist/cli/src/index.js sync --root . --tools codex --json`
- `npm run validate`
- `npm run verify:agent-e2e`
- `rg -n "prompt_pack_integrity_gate|screen_manifest|vision2prompt reference pipeline" .agents/skills/ow-vision2prompt/SKILL.md skills/build-prototype`

### C005 - Add Dailin-Grade Prompt-Pack Fixtures And Thin-Prompt Regressions

Purpose: prove the new contract and validators distinguish executable product
prototype briefs from short image prompts and internally inconsistent prompt
packs.

Validation:

- `npm run build`
- `npm run verify:runtime-surface`
- `npm run verify:agent-e2e`
- `npm run validate`

### C006 - Replay Smart City Prompt Pack With Dailin-Grade Contract

Purpose: re-run the smart city prompt-pack source shape through the new M98
contract to prove the formal YAML prompt pack carries the complete product
prototype brief before image generation.

Validation:

- `npm run build`
- `npm run verify:runtime-surface`
- `npm run validate`
- `node dist/cli/src/index.js validate --root . --json`
