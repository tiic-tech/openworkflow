# M106 Agent Resume Cockpit Candidate Changes

Source of truth: `CANDIDATE_CHANGES.yaml`

Status: active

Branch boundary: `codex/m101-build-proto-prompt-command-split`

## Scope

This queue owns the read-only `resume --json` cockpit: a compact recovery packet
for Agents resuming breakpoint work.

In scope:

- resume packet contract
- read-only CLI aggregation
- active planning queue and current work detection
- allowed/forbidden action guidance
- evidence classification for handoff

Out of scope:

- artifact lineage graph
- prompt2proto strategy engine
- provider-backed image generation metadata
- full write/commit preflight compiler

## Selection Policy

Selected candidate: none.

C001 defines the packet contract and command boundary before implementation
aggregates existing read models.

Next recommended candidate: C002.

## Candidates

### C001 - Define resume packet contract and command boundary

Status: done

Risk: medium

Purpose: define the `resume --json` packet shape, trust semantics, action
guidance, and read-only command boundary.

Depends on: none.

Selection artifacts:

- `changes/M106-agent-resume-cockpit/C001-define-resume-packet-contract-and-command-boundary/SELECTED_CHANGE.yaml`
- `changes/M106-agent-resume-cockpit/C001-define-resume-packet-contract-and-command-boundary/ATOM_TASKS.yaml`
- `changes/M106-agent-resume-cockpit/C001-define-resume-packet-contract-and-command-boundary/IMPLEMENTATION_BRIEF.md`

Completion:

- Defined the read-only resume packet contract in `references/planning-artifact-contracts.md`.
- Exposed the planned command boundary in CLI help without adding the full aggregator entrypoint.
- Runtime-surface verification asserts the contract-defined help boundary.
- Local commit evidence: `changes/M106-agent-resume-cockpit/C001-define-resume-packet-contract-and-command-boundary/LOCAL_COMMIT_EVIDENCE.yaml`

### C002 - Implement base resume aggregator

Status: ready

Risk: medium

Purpose: aggregate current state, handoff quality, next-command readiness,
summary quality, and git state into one read-only packet.

Depends on: C001.

### C003 - Detect active planning queue and current work item

Status: candidate

Risk: medium

Purpose: identify active queue, previous completed candidate, selected
candidate, missing evidence, and queue boundary overrides.

Depends on: C002.

### C004 - Classify actions and evidence for Agent handoff

Status: candidate

Risk: medium

Purpose: expose allowed actions, forbidden actions, primary evidence,
auxiliary evidence, and comparison evidence.

Depends on: C003.

### C005 - Expose resume in runtime surface and documentation

Status: candidate

Risk: medium

Purpose: update source-generated guidance, runtime verification, and docs so
Agents know when to use `resume --json`.

Depends on: C004.

## Deferred

- Artifact lineage graph: `M107-artifact-lineage-graph`
- Consistency-first prompt2proto strategy: `M108-consistency-first-split-later-prompt2proto`
- Provider and fallback generation metadata: `M109-provider-fallback-generation-metadata`
- Boundary preflight compiler: `M110-boundary-preflight-compiler`
