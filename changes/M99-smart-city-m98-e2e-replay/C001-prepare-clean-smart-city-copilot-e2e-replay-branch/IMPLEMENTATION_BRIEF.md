# C001 Implementation Brief

Change: Prepare clean `smart_city_copilot` E2E replay branch.

## Goal

Create and record a trustworthy baseline for the real `smart_city_copilot`
M98 prompt-pack replay before C002 runs any replay command. The baseline must
separate target repo branch/readiness state from later source-completeness
changes.

## Owned Paths

- `changes/M99-smart-city-m98-e2e-replay/`
- `/tmp/smart-city-m99-e2e-worktree/`
- `/Users/archy/Projects/StartUp/smart_city_copilot/`

## Implementation

Use the OpenWorkflow main repo dist CLI as the dogfood command surface:

- `node dist/cli/src/index.js handoff --root . --json`
- `node /Users/archy/Projects/StartUp/openworkflow/dist/cli/src/index.js handoff --root . --json`
- `node /Users/archy/Projects/StartUp/openworkflow/dist/cli/src/index.js validate --root . --json`
- `node /Users/archy/Projects/StartUp/openworkflow/dist/cli/src/index.js summaries --root . --strict --json`

Record the target worktree baseline:

- Worktree: `/tmp/smart-city-m99-e2e-worktree`
- Branch: `codex/m99-smart-city-m98-e2e-replay`
- HEAD: `2b977be`
- Dirty tree: clean
- Original worktree branch: `codex/smart-city-product-reality-e2e`
- No remote configured in the target worktree.

Record target readiness failures as baseline evidence only. Do not repair the
target repo during C001.

## Non-Goals

- Do not run the real replay.
- Do not run provider-backed image generation.
- Do not perform human visual review or visual reference parity scoring.
- Do not create proto2html artifacts.
- Do not model storyboard or motion.
- Do not modify OpenWorkflow source code.
- Do not clean, reset, or switch the original `smart_city_copilot` worktree.

## Verification

- Main repo handoff passed.
- Target worktree exists and is on `codex/m99-smart-city-m98-e2e-replay`.
- Target worktree is clean at `2b977be`.
- Target handoff/readiness failures are captured for C002.
- Existing target `PROTO_PROMPT_PACK.yaml` was scanned and is missing the M98
  source-completeness fields at baseline.
