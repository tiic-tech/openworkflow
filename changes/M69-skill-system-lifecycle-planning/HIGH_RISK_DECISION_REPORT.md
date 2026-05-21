# High Risk Decision Report: M69 Skill Delivery Boundary

Date: 2026-05-21

Scope: `S003` and `S007` in
`changes/M69-skill-system-lifecycle-planning/CANDIDATE_CHANGES.yaml`.

## Trigger

The non-high-risk M69 candidates are complete. The remaining candidates are:

- `S003`: Introduce skill registry and adapter delivery model
- `S007`: Prototype multi-adapter skill delivery without changing runtime semantics

Both are high risk because they touch OpenWorkflow's runtime delivery
architecture rather than a single generated surface, validator, or reference
document.

## S003 - Skill Registry And Adapter Delivery Model

### Why It Is High Risk

`S003` changes the boundary between semantic workflow definition and agent
platform delivery.

Current source-of-truth flow:

1. `packages/core/src/commands/registry.ts` defines semantic `/ow:*` commands.
2. `packages/core/src/artifacts/registry.ts` defines artifact contracts.
3. `packages/adapters/codex/src/*` renders repo-local Codex skills and adapter
   metadata.
4. `openworkflow init` and `openworkflow sync` write `.openworkflow/**`,
   `.agents/**`, and managed onboarding guidance.

`S003` would introduce a new layer between steps 1 and 3. If the layer is wrong,
it can either leak Codex details into core or make adapter behavior too abstract
to validate.

### Concrete Risks

- Core pollution: Codex path rules, frontmatter rules, or skill invocation
  rules could leak into `packages/core`.
- Over-abstraction: a delivery model designed for unknown future platforms
  could add concepts that no current consumer needs.
- Regression surface: `init`, `sync`, `doctor`, `validate`,
  `verify:runtime-surface`, and generated parity checks all depend on stable
  generated paths and metadata.
- Trust-model drift: OpenWorkflow's current default is repo-local delivery.
  A poorly scoped registry could reintroduce global prompt installation or
  user-home behavior by accident.
- Split authority: command semantics, artifact contracts, and delivery metadata
  could become competing sources of truth.

### Decision Options

Option A: Defer

- Do not implement S003 now.
- Keep current command registry plus Codex adapter structure.
- Revisit only when a second real delivery target is known.

Option B: Design-only

- Write an architecture note defining boundaries, invariants, and non-goals.
- Do not move code.
- Use the note to constrain a future implementation.

Option C: Narrow internal model

- Add a minimal source-level delivery metadata model used only by the Codex
  adapter.
- Preserve all existing generated paths and command semantics.
- No non-Codex output.

Option D: Full delivery registry implementation

- Introduce a first-class registry layer and refactor init/sync/adapter code to
  consume it.
- Highest blast radius. Requires broad validation and likely multiple commits.

### Recommended Path

Choose Option B first.

Reason: S003 is not blocked by missing code mechanics; it is blocked by unclear
architecture boundaries. A design-only change can decide the model without
risking generated-surface churn. After the design is accepted, a later candidate
can implement the smallest useful part.

### Guardrails If Approved

- Core may describe semantic delivery needs, but not platform path conventions.
- Codex path, frontmatter, and interface metadata rules stay in the Codex
  adapter.
- Repo-local delivery remains the default.
- Global prompt installation remains out of scope.
- Existing generated paths must remain backward compatible.
- Any implementation must preserve current `npm run validate` and
  `npm run verify:runtime-surface` drift checks.

### Go Criteria

Proceed only if the user explicitly chooses one option and accepts the intended
blast radius.

### Stop Criteria

Stop if the proposed implementation requires:

- changing `/ow:*` command semantics,
- committing non-Codex generated surfaces,
- weakening repo-local delivery,
- disabling generated-surface parity checks,
- or making core depend on Codex-specific file paths.

## S007 - Multi-Adapter Skill Delivery Spike

### Why It Is High Risk

`S007` depends on `S003` and attempts to prove another local agent skill target.
Without an accepted delivery model, a second adapter would have no stable
contract to implement.

### Concrete Risks

- Premature platform commitment: the spike may accidentally commit a second
  platform's generated files as product behavior.
- Format mismatch: another agent platform may have different skill discovery,
  frontmatter, invocation, or lifecycle rules.
- Validation gap: current validators are strong for Codex-generated surfaces,
  but not for unknown adapter surfaces.
- Repo pollution: experimental output could add generated folders that agents
  consume before they are trusted.
- Dependency inversion: implementing S007 before S003 could force the delivery
  model to match one experimental adapter instead of OW's durable principles.

### Decision Options

Option A: Block until S003 is accepted

- Do not start S007.
- Keep it as high risk and dependent on the delivery model decision.

Option B: Research-only spike

- Inspect one target platform and write a compatibility report.
- No generated files, no adapter code.

Option C: Dry-run adapter spike

- Add a non-committing renderer or verification-only output.
- No new generated platform surface is written by default.

Option D: Full second adapter

- Implement and commit a second adapter's generated output.
- Highest risk and not recommended until product behavior is accepted.

### Recommended Path

Choose Option A now. After S003 has an accepted design, choose Option B or C.

Reason: S007's purpose is to prove boundaries, but the boundary is exactly what
S003 must define. Doing S007 first would make the spike drive the architecture
instead of testing it.

### Guardrails If Later Approved

- Default command semantics stay `/ow:*`.
- Codex behavior remains unchanged.
- The spike must not commit new generated platform surfaces unless the user
  explicitly accepts them.
- Prefer dry-run output under temp directories or dev verification fixtures.
- Add adapter-specific validation before any generated files become durable.

### Go Criteria

Proceed only after S003 has an accepted boundary and the user chooses research,
dry-run, or full implementation.

### Stop Criteria

Stop if the spike requires:

- global installation,
- user-home prompt writes,
- changing Codex output,
- committing unvalidated second-platform generated files,
- or weakening current repo-local trust guarantees.

## Recommended Decision Path

1. Do not implement `S003` or `S007` directly from the current candidate queue.
2. Add a new focused candidate for `S003-design-only` if the user wants to
   proceed.
3. Keep `S007` blocked until the S003 design is accepted.
4. After S003 design, select one of:
   - narrow internal model,
   - research-only second platform report,
   - dry-run adapter spike.

## Default Agent Behavior For Future High-Risk Changes

When a selected queue reaches a `risk: high` candidate, the agent should stop
before implementation and produce a high-risk decision report with:

- candidate id and title,
- concrete risks,
- decision options,
- recommended path,
- guardrails,
- Go criteria,
- Stop criteria,
- validation expectations.

Implementation should resume only after explicit user approval of a concrete
decision option.
