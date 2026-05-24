# C003 Implementation Brief

Change: compare the real target replay against the M98 C006 fixture, M97 gap
notes, and the dailin prompt quality reference.

## Goal

Decide whether the real `smart_city_copilot` replay proves M98 prompt-pack
source completeness or exposes a remaining `/ow:vision2prompt` generator gap
that should be repaired before visual reference parity work starts.

## Comparison Sources

- Target replay:
  `/tmp/smart-city-m99-e2e-worktree/.openworkflow/prototypes/proto-001/PROTO_PROMPT_PACK.yaml`
- Target commit:
  `9a609cf901217cd1324e589459c90dfcddbad687`
- M98 fixture:
  `examples/m98-smart-city-replay/PROTO_PROMPT_PACK.yaml`
- M97 report:
  `docs/M97_PRODUCT_REALITY_E2E_SYNTHESIS_REPORT.md`
- Dailin prompt quality reference:
  `/Users/archy/Projects/StartUp/dailin/docs/OUTPUT_PROMPT.md`

## Decision

The real target replay proves M98 source completeness. It does not require a
new `/ow:vision2prompt` source-completeness repair before visual parity.

Remaining gaps belong to downstream work:

- visual reference parity
- storyboard/motion modeling
- richer multi-step demo flow comparable to dailin's complete journey prompts
- provider-backed image benchmark, if explicitly selected later

## Non-Goals

- Do not implement generator repair.
- Do not generate images.
- Do not perform visual review.
- Do not create proto2html artifacts.
- Do not model storyboard or motion.

## Verification

- `node dist/cli/src/index.js validate --root . --json`
- `node dist/cli/src/index.js summaries --root . --strict --json`
- `git diff --check`
