# M113 SpicyClaw Rename And Compatibility Candidate Changes

Source of truth: `CANDIDATE_CHANGES.yaml`

Status: active

Branch boundary: `codex/m101-build-proto-prompt-command-split`

## Scope

This queue captures the product rename from OpenWorkflow to SpicyClaw and the
compatibility path for source, docs, npm, CLI, generated guidance, and future
independent product architecture.

The current repo remains the Codex coding kit. The future product direction is
an independent SpicyClaw system with its own design philosophy and runtime
mechanism, potentially using an R backend for analysis, governance, artifact
quality, product drift, and Agent development intelligence.

## Availability Snapshot

- `spicyclaw` npm package: not found in the quick check.
- `@tiic-tech/spicyclaw` npm package: not found in the quick check.
- GitHub `spicyclaw` user/org/repo: not found in the quick check.
- `spicyclaw.com`: DNS exists.
- `spicyclaw.dev`, `.ai`, `.sh`, `.run`, `.io`, `.app`, `.tools`: no A/CNAME
  result in the quick DNS probe.

Re-check registries, registrar availability, and trademark risk before any
public publication.

## Selection Policy

Recommended first candidate: C001.

C001 should define the rename and compatibility contract before source files,
package names, command aliases, generated surfaces, or repository metadata are
changed.

## Candidates

### C001 - Define SpicyClaw rename and compatibility contract

Status: ready

Risk: medium

Purpose: establish product naming, compatibility guarantees, migration phases,
and stop conditions before technical rename work starts.

Depends on: none.

### C002 - Update brand language in source-owned docs

Status: candidate

Risk: medium

Purpose: move user-facing language toward SpicyClaw while keeping OpenWorkflow
commands and compatibility clear.

Depends on: C001.

### C003 - Add npm and CLI alias compatibility plan

Status: candidate

Risk: high

Purpose: prepare `@tiic-tech/spicyclaw` and `spicyclaw` CLI alias behavior
without publishing packages or removing OpenWorkflow compatibility.

Depends on: C001, C002.

### C004 - Migrate generated guidance and adapter branding

Status: candidate

Risk: high

Purpose: update source-generated guidance and adapter branding through source
templates and sync, not hand-edited generated files.

Depends on: C003.

### C005 - Design future SpicyClaw R backend product architecture

Status: deferred

Risk: high

Purpose: separate the current Codex coding kit from the future independent
SpicyClaw product architecture and define what the R backend should own.

Depends on: C001.

## Deferred

- R backend runtime implementation: `M114-spicyclaw-r-backend-runtime`
- Project SOUL/MEMORY product layer: `M112-project-soul-memory`
- Workflow root compatibility: `M115-spicyclaw-root-compatibility`
