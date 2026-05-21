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
- `M90-analyze-changes-command-quality-review` for deeper `/ow:analyze-changes`
  command-quality review. C004 only aligns the immediate runtime-surface wording
  expectation so vision stress fixtures can run.

Branch boundary: `codex/m73-workflow-blueprint-runtime-alignment`

Completed candidates: `C001`, `C002`, `C003`

Selected candidate: `C004`

Next recommended candidate: none until `C004` is completed or superseded.

## Selection Policy

Prefer changes that fix the human interaction flow first, preserve auditability,
make vision acceptance depend on proto prompt readiness, and keep each selected
change implementation-sized.

Avoid changes that rebuild vision, validation, proto, and tune together.

## Candidates

### C001 - Define /ow:vision delayed-compile contract and native build-vision skill

Status: `done`

Risk: `medium`

Defines interview, checkpoint, and compile modes before source behavior changes.
It also adds the missing native `skills/build-vision/` source skill so vision
has the same source-skill foundation as validation, proto, and tune.

Selection: `C001-build-vision-delayed-compile-contract`

Completion evidence:

- `changes/M84-vision-delayed-compile-proto-readiness/C001-build-vision-delayed-compile-contract/LOCAL_COMMIT_EVIDENCE.yaml`
- `0140a0109ff9da718952a37a422cfcf527264b51`

### C002 - Extend vision artifacts with proto-readiness and coverage matrix

Status: `done`

Risk: `medium`

Adds strategic core, product system seed, proto-readiness, and coverage
structures so a downstream Agent can tell whether `/ow:proto` can generate
strong prototype prompt packs without inventing strategy.

Selection: `C002-vision-proto-readiness-artifacts`

Completion evidence:

- `changes/M84-vision-delayed-compile-proto-readiness/C002-vision-proto-readiness-artifacts/LOCAL_COMMIT_EVIDENCE.yaml`
- `83d3acc4113b45f860c2873649ef397285b361f6`

### C003 - Upgrade /ow:vision skill protocol for product partner interrogation

Status: `done`

Risk: `medium`

Encodes the product partner, requirements interrogator, and intent compiler role
into `/ow:vision` generated guidance and command protocol.

Selection: `C003-vision-generated-protocol`

Completion evidence:

- `changes/M84-vision-delayed-compile-proto-readiness/C003-vision-generated-protocol/LOCAL_COMMIT_EVIDENCE.yaml`
- `010ab1af29850200987ad80a7023f27024a7e1eb`

### C004 - Add /ow:vision delayed-compile stress tests and fixtures

Status: `selected`

Risk: `medium`

Adds verification coverage for thin, blocked, and compile-ready vision states,
plus generated-surface drift protection for the delayed-compile contract.

Selection: `C004-vision-delayed-compile-stress-fixtures`
