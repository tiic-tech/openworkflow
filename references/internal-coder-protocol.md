# Internal Coder Protocol

This reference defines the contract boundary for future `/ow:coder` work.
It is a semantic contract only. It does not register a command, generate a
runtime skill, introduce a schema, enforce a gate, or change CLI JSON output.

## Core Contract

`/ow:coder` is an internal, Agent-only engineering quality protocol for source
edits. It is not a normal user-facing workflow command, not a "write code"
entrypoint, and not a replacement for `/ow:change` or `/ow:team`.

The protocol exists to make code-changing Agents prove that they understand the
change boundary, can produce meaningful RED/GREEN evidence when behavior is
changing, and can bind validation evidence back to the selected change or run
they are executing.

Future command metadata should use:

```yaml
trigger: /ow:coder
visibility: internal
stage: execution
audience: agent
```

## Non-Goals

`/ow:coder` must not:

- appear as the recommended user handoff for normal product work
- replace `/ow:change` as the selected-change implementation boundary
- replace `/ow:team` as the managed multi-agent execution runtime
- create a generic autonomous coding loop that ignores queue scope
- require `CODER_EVIDENCE.yaml` before the evidence shape is proven
- mutate `.openworkflow/**`, generated `.agents/**`, git state, or remote state
  by itself

## Responsibility Boundary

`/ow:change` owns the implementation boundary: selected change, owned paths,
forbidden paths, acceptance, validation commands, and stop conditions.

`/ow:team` owns coordinated execution when work is delegated to an Agent Team:
task assignment, progress, team evidence, and handoff back to the user.

`/ow:coder` owns the quality protocol that constrains either path when source
files are edited. It answers:

- What files, owners, and dependencies are in scope?
- What target behavior or contract gap must be observed before editing?
- What exact evidence proves the implementation moved from RED to GREEN?
- What self-check was applied after writes?
- Which validation ladder is honest for this change?
- Where is the evidence bound so a later Agent can resume or audit it?

## Required Gates

### 1. Trust Recovery

Before source edits, an Agent should recover the current trust state from the
repo-local read model:

- `node dist/cli/src/index.js resume --root . --json` after interruption or
  low-context recovery
- `node dist/cli/src/index.js handoff --root . --json` for strict trust entry
- `node dist/cli/src/index.js inspect --root . --strict --json` for read order,
  blockers, active queue, and next-command readiness
- `git status --short --branch` for branch and dirty-tree boundaries

The result must identify the selected queue or change before implementation
starts. A green entry command is scoped trust, not release readiness.

### 2. Owner, File, And Dependency Map

Before editing, the Agent must state or internally bind:

- selected plan id and candidate id, when queue-driven
- source-of-truth artifact for the rule being changed
- files expected to change
- files explicitly forbidden by the selected change
- dependency order between docs, schemas, validators, registries, generated
  surfaces, and tests
- whether generated surfaces are source outputs or source owners

This map prevents accidental second sources of truth. If the map reveals that a
generated surface would need a manual patch, the change must move back to the
source owner instead.

### 3. RED Evidence

For behavior, validator, CLI report, generated-surface, path-safety, summary,
queue, or git-evidence changes, the Agent should produce RED evidence before
production edits. RED evidence is the smallest command, fixture, or parsed
assertion that exposes the target defect or missing contract.

Valid RED evidence can include:

- a failing parsed JSON or YAML assertion
- a failing valid or invalid fixture
- a failing generated-surface parity check
- a failing summary, handoff, or resume health assertion
- a targeted compile or runtime verifier failure

RED evidence is optional only when the selected change is documentation-only,
contract-only, or exploratory. In that case, the Agent must say that RED is not
applicable and use the nearest structural check.

### 4. GREEN Evidence

After edits, the Agent reruns the RED evidence or nearest equivalent and proves
the target failure is gone. GREEN evidence should be narrower than release
readiness and tied to the touched trust domain.

For docs-only contract work, GREEN evidence is structural: the expected
reference exists, the selected-change artifacts point at it, trust entry commands
still pass, and whitespace/diff checks are clean.

### 5. Post-Write Self-Check

Before final validation, the Agent must inspect its own diff for:

- source-of-truth drift
- new hidden dependencies
- accidental generated-surface edits
- overly broad module or artifact churn
- comments that narrate obvious behavior instead of explaining why
- validation commands that do not match the touched trust domain

This self-check is not a substitute for commands. It is a design gate before
command evidence is trusted.

### 6. Validation Ladder

The selected validation ladder must match the change type:

- docs or planning contract: strict handoff/inspect/resume plus `git diff --check`
- command registry or generated protocol: build, sync preview or sync, generated
  diff review, and runtime-surface verification
- artifact, schema, or validator: build, validate, and targeted valid/invalid
  fixtures
- summary or recovery surfaces: handoff, inspect, summaries, resume, and a
  targeted fixture or command packet
- git evidence: git-automation preview or commit evidence check plus strict
  read-model commands

Broad `npm run validate` is release-domain evidence. It is valuable, but it must
not be the only proof for a narrow implementation change, and existing
historical red failures must be reported as residual risk instead of hidden.

### 7. Evidence Binding

Coder evidence should be bound to the current OW work item without requiring a
new persistent artifact in this contract stage.

Initial binding points:

- `SELECTED_CHANGE.yaml` for scope and acceptance
- `ATOM_TASKS.yaml` for task-level status and verification commands
- `IMPLEMENTATION_BRIEF.md` for handoff instructions
- `LOCAL_COMMIT_EVIDENCE.yaml` when a candidate changes implementation files
- optional embedded `LOCAL_COMMIT_EVIDENCE.yaml.coder_evidence` for preflight,
  RED/GREEN, self-check, validation ladder, and lesson evidence when present
- future standalone `CODE_EVIDENCE.yaml` or `CODER_EVIDENCE.yaml` only as a
  separate candidate change after the embedded field shape proves insufficient

Evidence must include command names and enough result detail for a later Agent
to distinguish targeted GREEN evidence from unrelated historical failures.

## Future Integration Points

These are integration points, not C001 implementation tasks.

- `/ow:change`: include coder preflight expectations in selected implementation
  boundaries.
- `/ow:team`: require team execution to preserve RED/GREEN/self-check evidence
  before completion.
- `git-automation`: attach coder validation evidence to local commit evidence
  when implementation files changed.
- `resume`: report whether coder governance is required, complete, skipped, or
  missing for the active selected change.
- `context`: include coder preflight and validation-ladder guidance when the
  requested command can edit source.
- `handoff`: surface missing coder evidence as guidance before any hard failure
  policy exists.
- `summaries`: summarize coder gate state only from trusted selected-change or
  commit evidence.
- `inspect`: expose coder gate status in the read model once the source fields
  are stable.

## Acceptance Bar

A future `/ow:coder` implementation is acceptable only when:

- it remains `visibility: internal`
- user-facing handoffs continue to use product commands such as `/ow:change`,
  `/ow:team`, `/ow:tune`, `/ow:design`, or `/ow:spec`
- generated Agent surfaces derive from source registry, skill, or adapter
  owners
- missing coder evidence is guidance before it becomes enforcement
- active queue state, owned paths, forbidden paths, validation expectations, and
  evidence bindings are visible to a low-context Agent
