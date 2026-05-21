# M84 Vision Delayed Compile And Proto Readiness

Source of truth: `CANDIDATE_CHANGES.yaml`.

This queue is the first bounded implementation slice from
`docs/DISCOVER_LOOP_UPGRATE_PLAN.md`. It focuses only on `/ow:vision` delayed
compile and proto-readiness. It does not rebuild validation, proto, tune, or the
full discovery loop.

## Scope Boundary

Current boundary: upgrade `/ow:vision` so it can run a long, low-latency
interview, avoid durable per-answer writes, checkpoint intentionally, and
compile final vision artifacts only when proto-readiness is strong enough for
`/ow:proto` to generate high-quality prompt packs.

Deferred features:

- `M85-validation-proto-target-contract`
- `M86-proto-strategy-prompt-compiler`, including absorption of the
  `vision_to_strategic_prototype_prompt` reference skill
- `M87-tune-product-system-inheritance`, including absorption of the
  `prototype_tune_to_refined_prompt` reference skill
- `M88-discovery-loop-read-model`
- `M89-discovery-loop-e2e-dogfood`

Branch boundary: `codex/m73-workflow-blueprint-runtime-alignment`

Selected candidate: `C001`

Next recommended candidate: none until `C001` is completed or superseded.

## Selection Policy

Prefer changes that fix the human interaction flow first, preserve auditability,
make vision acceptance depend on proto prompt readiness, and keep each selected
change implementation-sized.

Avoid changes that rebuild vision, validation, proto, and tune together.

## Candidates

### C001 - Define /ow:vision delayed-compile contract and native build-vision skill

Status: `selected`

Risk: `medium`

Defines interview, checkpoint, and compile modes before source behavior changes.
It also adds the missing native `skills/build-vision/` source skill so vision
has the same source-skill foundation as validation, proto, and tune.

Selection: `C001-build-vision-delayed-compile-contract`

### C002 - Extend vision artifacts with proto-readiness and coverage matrix

Status: `candidate`

Risk: `medium`

Adds strategic core, product system seed, proto-readiness, and coverage
structures so a downstream Agent can tell whether `/ow:proto` can generate
strong prototype prompt packs without inventing strategy.

### C003 - Upgrade /ow:vision skill protocol for product partner interrogation

Status: `candidate`

Risk: `medium`

Encodes the product partner, requirements interrogator, and intent compiler role
into `/ow:vision` generated guidance and command protocol.

### C004 - Add /ow:vision delayed-compile stress tests and fixtures

Status: `candidate`

Risk: `medium`

Adds verification coverage for thin, blocked, and compile-ready vision states,
plus generated-surface drift protection for the delayed-compile contract.
