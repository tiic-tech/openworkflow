# High-Risk Decision Report - M54 Planning Skill Runtime Exposure

## Trigger

Execution reached `C004`, the next recommended candidate in
`changes/M54-decompose-select-change-planning/CANDIDATE_CHANGES.yaml` after
`C007` completed native cross-queue selection arbitration.

`C004` is marked `risk: high` because it would promote repo-local planning
skills into OpenWorkflow runtime and generated adapter surfaces.

## Change

Candidate: `C004`

Title: Expose planning skills through OpenWorkflow runtime surfaces

Status: `ready`

The candidate proposes adding planning skill exposure through command registry
entries or equivalent skill registry entries, artifact contract registration,
Codex adapter generation, runtime-surface verification, and agent e2e
verification.

This report is evidence, not approval. Implementation may resume only after the
user explicitly approves one concrete option below.

## Concrete Risks

- Runtime authority drift: source skills, semantic `/ow:*` commands, artifact
  contracts, and generated Codex skills could become competing sources of
  truth.
- Generated-surface churn: `.agents/**`, `.openworkflow/**`, and `AGENTS.md`
  are managed surfaces; hand-editing or broad regeneration could hide product
  regressions.
- Adapter coupling: Codex-specific paths, frontmatter, and generation rules
  could leak into core registries instead of staying in the Codex adapter.
- Read-model bloat: planning artifacts could enter default low-context packets
  without summary or budget contracts, undermining Phase 2 artifact economy.
- Validation gaps: runtime exposure needs `validate`, `sync`, `doctor`,
  `verify:runtime-surface`, and `verify:agent-e2e` coverage to prove generated
  parity and startup trust.
- Scope expansion: a single change could unintentionally cover command
  registry, artifact registry, adapter delivery, generated files, and e2e
  fixtures at once.

## Decision Options

### Option A - Defer Runtime Exposure

Do not implement `C004` now. Keep `decompose-to-changes`, `analyze-changes`,
and `select-change` as repo-local dogfood skills until lifecycle transactions
and artifact economy contracts are stronger.

Impact: safest. Planning skills remain useful locally but are not exposed as
first-class runtime surfaces.

### Option B - Design-Only Boundary

Do not move runtime code. Write a focused design artifact that defines the
planning-skill exposure boundary, invariants, generated-surface ownership,
summary/read-model expectations, validation gates, and candidate split.

Impact: recommended first step. It resolves architecture ambiguity with low
blast radius and creates a safer implementation queue.

### Option C - Narrow Contract Spike

Implement only a non-generated contract or fixture proving how planning
artifacts should be registered and summarized. Do not change adapter generation
or expose user-facing `/ow:*` runtime commands.

Impact: moderate risk. Useful after Option B if the design needs proof, but it
still touches validation semantics.

### Option D - Full C004 Runtime Exposure

Implement command registry entries, artifact registry changes, Codex adapter
generation, runtime-surface verification, and agent e2e verification in one
candidate.

Impact: highest risk. Not recommended as the next step because it combines
multiple authority boundaries and generated surfaces.

## Recommended Path

Choose Option B first.

Reason: `C004` is primarily blocked by unclear runtime authority boundaries,
not by missing source-skill behavior. A design-only change can decide what
belongs in core, artifacts, adapters, summaries, and generated surfaces before
any runtime exposure changes are made.

## Approved Decision

Approved on 2026-05-21: proceed with **Option B - Design-Only Boundary**.

The approved scope is limited to design and planning artifacts. It may define
runtime exposure boundaries, invariants, validation gates, and follow-up
candidate splits, but it must not edit runtime registry code, artifact registry
code, adapter generation code, or generated `.agents/**` and `.openworkflow/**`
surfaces.

After Option B, split implementation into smaller candidates such as:

- `C004a`: runtime exposure design and checklist only.
- `C004b`: planning artifact registration and summary/read-model contract.
- `C004c`: command or skill registry surface, without adapter generation.
- `C004d`: Codex adapter generation for accepted planning surfaces.
- `C004e`: runtime-surface and agent e2e verification fixtures.

Approved on 2026-05-21: proceed with the **C010 Narrow Core Command
Semantics** follow-up.

The approved semantic direction is that the planning source skills become
formal OpenWorkflow command ids:

- `/ow:decompose-to-changes`
- `/ow:analyze-changes`
- `/ow:select-change`

The approved C010 scope is limited to recording the core command semantics,
authority boundaries, and source-of-truth ownership for these command ids. C010
does not authorize Codex adapter generation, generated `.agents/**` surfaces,
or broad runtime delivery. Those remain gated by the C011 high-risk candidate
after the C010 semantics are complete.

## Guardrails

- Do not hand-edit generated `.agents/**`, `.openworkflow/**`, or `AGENTS.md`
  to make product behavior appear correct.
- Keep semantic command definitions in core and platform-specific delivery in
  adapters.
- Keep Codex frontmatter, path, and generated-file conventions out of core
  artifact semantics.
- Preserve repo-local delivery as the default trust model.
- Add or update validators before trusting any new generated surface.
- Keep low-context read models summary-first; do not load full candidate queues
  by default.
- Keep each follow-up candidate small enough for one selected-change commit.

## Go Criteria

Implementation may resume only when the user explicitly approves one concrete
option:

- `Approve Option A`
- `Approve Option B`
- `Approve Option C`
- `Approve Option D`
- `Approve C010 Narrow Core Command Semantics`

Ambiguous instructions such as "continue" are not enough to select or implement
runtime exposure.

## Stop Criteria

Stop again if:

- a design-only change starts editing runtime registry or adapter generation
  code,
- implementation requires generated-surface changes before the boundary is
  accepted,
- the change mixes core registry, artifact registry, adapter generation, and
  e2e fixtures in one commit,
- validation requires weakening parity or generated-file checks,
- the current branch does not match `queue_policy.branch_boundary`,
- unrelated dirty paths appear in the working tree.

## Validation Expectations

Any approved follow-up must run at least:

- `npm run validate`
- `git diff --check`

Runtime exposure follow-ups must also run the relevant surface checks:

- `npm run verify:runtime-surface`
- `npm run verify:agent-e2e`
