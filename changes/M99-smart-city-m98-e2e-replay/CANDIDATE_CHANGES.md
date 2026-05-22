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
| C001 | done | medium | Prepare clean smart_city_copilot E2E replay branch | none |
| C002 | done | medium | Run target-repo M98 prompt-pack source replay | C001 |
| C003 | done | medium | Compare real replay against C006 fixture and M97 gap notes | C002 |

## Next Recommendation

The M99 queue is complete. C003 recommends proceeding to a dedicated visual
reference parity gate, not repairing `/ow:vision2prompt` for M98 source
completeness.

## Candidate Details

### C001 - Prepare Clean Smart_City_Copilot E2E Replay Branch

Purpose: isolate the target repo test branch and record baseline trust gates
before replay.

Outcome: completed. The clean target worktree is
`/tmp/smart-city-m99-e2e-worktree` on
`codex/m99-smart-city-m98-e2e-replay` at `2b977be`, with a clean dirty-tree
baseline. Target handoff/readiness failures were recorded as baseline evidence;
no real replay or target mutation was performed.

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

Outcome: completed. Target commit `9a609cf` refreshed the target managed
OpenWorkflow surface and updated `proto-001` prompt-pack source artifacts. The
target prompt pack now contains the M98 source-completeness fields, keeps
`image_generation.status: not_started`, and target validate/strict
summaries/handoff pass.

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

Outcome: completed. The real target replay is source-complete against the M98
contract and matches the C006 fixture on required prompt-pack shape. Compared
with dailin's `OUTPUT_PROMPT.md`, the target replay aligns on direct
generatability and screen-bound product detail; remaining full-journey,
storyboard, and visual-parity richness are downstream queues.

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
