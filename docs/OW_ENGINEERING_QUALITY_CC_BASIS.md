# OpenWorkflow Engineering Quality CC Basis

Date: 2026-05-23

Status: highest-priority candidate-change basis, not an implemented change

## Executive Verdict

OpenWorkflow has the right product thesis: an Agent-first, contract-driven
workflow control plane that can restore context, expose trust state, and guide
safe continuation. The current implementation does not yet meet that ambition.
It is a strong, fast-moving prototype with unusually good validation intent, but
it carries architectural debt that will block OW from becoming a top-tier
developer tool unless it is addressed before more workflow surface is added.

The highest-priority CC should therefore be an engineering-quality foundation
change, not another product-stage expansion. The goal is to make OW's own code
and trust gates behave like the product it promises: one source of truth,
layered validation, small modules, deterministic diagnostics, safe mutations,
and low-context Agent consumption.

## Current Evidence

Commands checked on 2026-05-23 from `/Users/archy/Projects/StartUp/openworkflow`:

```text
node dist/cli/src/index.js handoff --root . --json
node dist/cli/src/index.js inspect --root . --strict --json
npm run validate
node /Users/archy/.codex/skills/ow-code-quality-governor/scripts/ow_quality_snapshot.mjs /Users/archy/Projects/StartUp/openworkflow
```

Observed state:

- `handoff --json` reports `ok: true`.
- `inspect --strict --json` reports `ok: true`.
- `npm run validate` reports repository validation failure.
- The validation failures span multiple trust domains: historical candidate
  queues, malformed YAML, missing `ATOM_TASKS.yaml` contract keys, missing
  commit evidence, high-risk report section drift, and a stale example prompt
  pack shape.
- The quality snapshot reports several oversized source files:
  - `packages/cli/src/dev/verifyRuntimeSurface.ts`: 4949 lines
  - `packages/core/src/validators/validateRepositoryContracts.ts`: 2950 lines
  - `packages/core/src/validators/validateOpenWorkflow.ts`: 1987 lines
  - `packages/core/src/commands/registry.ts`: 1852 lines
  - `packages/core/src/artifacts/registry.ts`: 1186 lines
  - `packages/core/src/workflow/summaryHealth.ts`: 750 lines
- The snapshot also reports raw path-prefix checks, synchronous filesystem
  checks inside validators, type escapes in dev verifiers, and extensive
  substring assertions.

The important product-level defect is not merely that validation is red. The
defect is that OW currently has multiple trust gates that can tell an Agent
different stories about whether the repo is safe to continue.

## Critical Findings

### P1 - Trust Signals Are Not Coherent

Agent-facing trust commands can return green while repository-level validation
is red. This undermines OW's core promise. If `handoff`, `inspect`, `summaries`,
`doctor`, `context --handoff`, and `validate` are allowed to disagree without a
clear trust-domain explanation, Agents will learn to ignore one of them.

Required principle:

Every trust command must declare its validation domain. When a broader domain is
red, narrower green commands must expose that distinction instead of implying
overall repository readiness.

### P1 - Contract Truth Sources Are Duplicated

OW's contract behavior currently appears across TypeScript registries, JSON
schemas, runtime validators, repository validators, generated Codex surfaces,
source skills, examples, and dev verifiers. This is the largest structural
risk. A contract-first system cannot survive if every contract change requires
manual edits in many places.

Required principle:

Command protocol, artifact shape, readiness gates, generated surfaces, and
validation diagnostics should derive from one typed source model wherever
possible. Any temporary duplication must have an explicit retirement path.

### P1 - God Files Are Becoming Architecture

Several core files are too large to review, reason about, or safely extend. The
current direction encourages adding another branch to a giant validator or
another assertion to a giant verifier. That makes every future change more
fragile.

Required principle:

Files above roughly 500 lines require active suspicion. Files above roughly
1000 lines need a split plan unless they are generated or intentionally
data-only. New behavior should be isolated by domain: path safety, YAML IO,
artifact model, command model, active pointers, summary health, queue evidence,
git evidence, and generated adapter parity.

### P1 - Protocols Are Too Stringly Typed

Large parts of OW's command behavior are expressed as arrays of prose strings.
This gives Agents useful instructions, but it is a weak foundation for
validation, migration, diffing, testing, and generation. It also makes protocol
semantics hard to enforce.

Required principle:

Prose should be rendered from structured protocol objects. The executable model
must know what is a required context path, forbidden output, readiness gate,
state transition, policy, or diagnostic. Prose is the view, not the source.

### P2 - Validation Domains Are Mixed Together

`npm run validate` currently scans broad repository surfaces and reports
historical planning debt, active queue debt, fixture debt, evidence debt, and
release readiness debt together. That is useful for a release gate, but too
coarse for everyday Agent continuation.

Required principle:

Split validation into explicit domains such as:

- runtime workflow surface
- source contract model
- generated adapter parity
- active queue and selected change
- historical archive health
- fixture corpus
- release readiness

Each domain should have its own command or structured section, caller intent,
and remediation guidance.

### P2 - Path Safety Is Not Centralized Enough

Some code uses `resolve` and a root-boundary check; other code uses `join` plus
prefix checks. Security-sensitive helper logic should not be hand-written in
multiple validators.

Required principle:

All root containment, local reference resolution, and write path checks should
go through a single audited helper API. The helper must be tested against
relative escapes, path-prefix collisions, absolute paths, and external refs.

### P2 - Test Strategy Is Too Brittle

OW has meaningful dev verification, but too much behavior is still asserted via
substring checks over structured YAML or generated text. That catches some
regressions but resists refactoring and hides semantic gaps.

Required principle:

Prefer structural assertions over prose matching: parse YAML or JSON, normalize
objects, assert fields, enums, relationships, health error categories, and
state transitions. Keep full E2E checks, but do not make one giant verifier the
only safety net.

## Priority CC Seed

Recommended plan title:

```text
OW engineering quality foundation and trust-gate coherence
```

Recommended first candidate sequence:

1. **C001 - Define validation trust domains and report taxonomy**
   - Produce the domain model for `handoff`, `inspect`, `summaries`, `doctor`,
     `context --handoff`, `validate`, runtime verifiers, fixture checks, and
     release checks.
   - Acceptance: each command can state which trust domain it covers and which
     broader domains it intentionally does not cover.

2. **C002 - Introduce shared path-safety and local-reference helpers**
   - Centralize root containment and reference resolution.
   - Replace ad hoc path checks in validators without changing public behavior.
   - Acceptance: helper tests cover escape, prefix-collision, absolute path,
     external ref, missing file, and valid local reference cases.

3. **C003 - Split repository validation into explicit domain sections**
   - Keep existing release-style validation available, but classify failures by
     domain and caller relevance.
   - Acceptance: current broad validation failures are grouped into actionable
     categories instead of one flat list.

4. **C004 - Extract artifact and queue validators from god files**
   - Start with the highest-churn areas: candidate queue completion evidence,
     local commit evidence, high-risk report checks, prototype prompt-pack
     fixture checks.
   - Acceptance: `validateRepositoryContracts.ts` shrinks and new modules own
     cohesive domains with targeted tests.

5. **C005 - Replace brittle verifier substring assertions with structural checks**
   - Convert priority YAML/JSON assertions in runtime surface verification to
     parsed-object assertions.
   - Acceptance: at least one major verifier section can survive harmless prose
     rewording while still detecting semantic regressions.

6. **C006 - Create typed protocol source model for command and artifact contracts**
   - Begin the migration from prose arrays and parallel registries toward a
     single source model that can render generated surfaces and feed validators.
   - Acceptance: one command family or artifact family is generated and
     validated from the model end to end.

7. **C007 - Add entry-command performance and scan-budget reporting**
   - Make broad scans visible, measured, and justifiable.
   - Acceptance: entry commands expose or log what they scanned and avoid full
     repo walks when current pointers or indexes are sufficient.

## Stop Criteria

This CC should not be allowed to become an unbounded cleanup project. Stop or
split when:

- a candidate touches more than one primary trust domain without a clear reason
- a refactor changes public CLI JSON shape without an explicit contract change
- generated `.agents` files are edited as durable fixes
- validation remains red and the candidate cannot distinguish old debt from new
  behavior
- the change improves aesthetics but does not reduce duplication, false trust,
  unsafe mutation, or verification ambiguity

## Definition Of Done

The foundation CC is successful when:

- OW trust commands no longer imply global readiness when a broader relevant
  validation domain is red.
- Repo validation failures are classified by domain and remediation path.
- At least one duplicated contract family has a single typed owner feeding
  generated surface and validation behavior.
- Path safety is centralized behind a tested helper.
- The largest validator/verifier files have credible split boundaries and at
  least one high-churn domain extracted.
- A future Agent can start from `handoff`, `inspect`, and the validation report
  without needing the previous conversation to understand what is trustworthy.

## Operating Rule For Future OW Work

Until this CC or its equivalent is complete, new product-stage expansion should
be treated as lower priority than engineering-quality foundation work unless it
directly reduces trust-signal drift, contract duplication, unsafe mutation, or
validation ambiguity.
