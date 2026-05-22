# C002 Implementation Brief

Change: run the real `smart_city_copilot` M98 prompt-pack source replay.

## Goal

Use the clean target worktree prepared by C001 to refresh the target
OpenWorkflow command surface and replay the smart city prompt-pack source
through the current M98 `/ow:vision2prompt` contract. Stop before image
generation and visual review.

## Target Commit

- Worktree: `/tmp/smart-city-m99-e2e-worktree`
- Branch: `codex/m99-smart-city-m98-e2e-replay`
- Commit: `9a609cf901217cd1324e589459c90dfcddbad687`

## Implementation

The target replay:

- refreshed stale managed `ow-vision2prompt`, `ow-proto`, and
  `ow-prompt2proto` surfaces with the main repo dist CLI;
- rewrote `.openworkflow/prototypes/proto-001/PROTO_PROMPT_PACK.yaml` as a
  M98-complete source pack using the target repo vision and validation;
- updated matching `EVIDENCE.yaml`, `PROTO_PROMPT_PACK.md`, `REVIEW_PLAN.md`,
  `NOTE.md`, and `SUMMARY.yaml`;
- kept `image_generation.status: not_started`;
- did not delete historical image files, but explicitly excluded them as C002
  replay outputs.

## Non-Goals

- No provider-backed image generation.
- No human visual review.
- No visual reference parity claim.
- No proto2html.
- No storyboard or motion modeling.
- No OpenWorkflow source code changes.
- No remote push.

## Verification

- Target `validate --root . --json` passed.
- Target `summaries --root . --strict --json` passed.
- Target `handoff --root . --json` passed with trusted handoff quality.
- Target `git diff --check` passed.
- Target branch is clean after commit.
