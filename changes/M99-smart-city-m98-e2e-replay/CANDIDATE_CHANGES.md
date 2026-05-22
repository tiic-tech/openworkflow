# M99 Smart City M98 E2E Replay

Source of truth: `CANDIDATE_CHANGES.yaml`

Status: active

Branch boundary: `codex/m99-smart-city-m98-e2e-replay`

## Scope

Run a clean `smart_city_copilot` target-repo replay against the final M98
prompt-pack contract before starting visual reference parity work.

This queue proves or falsifies real workflow source completeness. It does not
own provider-backed image generation, visual review, proto2html, production GIS
integration, or storyboard/motion modeling.

## Candidates

| ID | Status | Risk | Title | Dependencies |
| --- | --- | --- | --- | --- |
| C001 | ready | medium | Prepare clean smart_city_copilot E2E replay branch | none |
| C002 | candidate | medium | Run target-repo M98 prompt-pack source replay | C001 |
| C003 | candidate | medium | Compare real replay against C006 fixture and M97 gap notes | C002 |

## Next Recommendation

Select `C001` first. It creates the clean target-repo branch/readiness baseline
needed before any `smart_city_copilot` replay is run.

## Candidate Details

### C001 - Prepare Clean Smart_City_Copilot E2E Replay Branch

Purpose: isolate the target repo test branch and record baseline trust gates
before replay.

Validation:

- `git status --short --branch`
- `node dist/cli/src/index.js handoff --root . --json`
- target repo `git status --short --branch`
- target repo handoff/readiness command

Acceptance:

- Target repo E2E branch is named and recorded.
- Dirty-tree state is captured before replay.
- No unrelated target artifacts are removed or overwritten.
- Replay can proceed from a known baseline.

### C002 - Run Target-Repo M98 Prompt-Pack Source Replay

Purpose: execute the real `smart_city_copilot` prompt-pack replay and collect
formal prompt-pack evidence before image generation.

Acceptance:

- Real target prompt pack includes `prototype_brief`, `screen_manifest`, global
  design prompt, screen prompts, negative prompts, quality rubric, integrity
  gate, and reality gate.
- Planning, incident, and asset capacity are modeled inside one map-first
  product shell.
- No provider-backed image generation or visual parity claim occurs.

### C003 - Compare Real Replay Against C006 Fixture And M97 Gap Notes

Purpose: decide whether M98 source completeness holds in the real target repo
or whether `/ow:vision2prompt` generation still needs repair.

Acceptance:

- Evidence states whether the real replay prompt pack is source-complete.
- Evidence distinguishes topology/source completeness from visual reference
  parity.
- Next recommendation is either proceed to visual parity gate or repair
  `/ow:vision2prompt` generation.

## Deferred

- `M100-prototype-visual-reference-parity-gate`
- `M101-prototype-storyboard-motion-model`
- `M102-provider-image-generation-benchmark`
