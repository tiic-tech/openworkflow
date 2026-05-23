# M106 Agent Resume Cockpit Candidate Changes

Source of truth: `CANDIDATE_CHANGES.yaml`

Status: active

Branch boundary: `codex/m101-build-proto-prompt-command-split`

## Scope

This queue owns the read-only `resume --json` cockpit: a compact recovery packet
for Agents resuming breakpoint work.

First-consumer success standard: a human should be able to open a new session
after network loss, context overflow, compaction failure, or another unexpected
interruption and say only "use OW resume and continue." The fresh Agent should
then understand the project overview, current queue, task boundary, breakpoint,
behavior boundaries, allowed work, validation expectations, and smallest correct
next OW-maintained action without extra human explanation.

North-star constraint: OW should not become a generic repeated Agent loop. The
final operating model should let Agents use the least sufficient context, choose
the most precise bounded action, recover from interruptions into corrected and
ranked atom-task execution, and preserve product-alignment signals so each
atom-task reduces vision-product drift instead of merely moving code.

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

Success focus: establish the executable read-only command and base packet that
is useful to a fresh Agent even before active queue scanning is complete.
The base packet should prefer OW trust surfaces over broad repo rediscovery.

Depends on: C001.

Acceptance focus:

- Project overview, trust state, next action, and git cleanliness are present.
- Unknown active queue/work item state is explicit instead of guessed.
- Existing OW surfaces are enough for a healthy initialized project; resume does
  not force whole-repo scanning.
- The command remains read-only.

### C003 - Detect active planning queue and current work item

Status: candidate

Risk: medium

Purpose: identify active queue, previous completed candidate, selected
candidate, missing evidence, and queue boundary overrides.

Success focus: make resume queue-aware enough to locate the real breakpoint
instead of sending a fresh Agent back to generic `CURRENT_STATE.next_command`.
The result should be a ranked queue-local next action, not an unbounded loop.

Depends on: C002.

Acceptance focus:

- Active queue and current work item are identified when obvious.
- Breakpoint is reported as selected candidate, next ready candidate, incomplete
  atom task, missing evidence, or clean handoff point.
- The next action is ranked when evidence is clear.
- The Agent can tell what to select or implement next without human memory.

### C004 - Classify actions and evidence for Agent handoff

Status: candidate

Risk: medium

Purpose: expose allowed actions, forbidden actions, primary evidence,
auxiliary evidence, and comparison evidence.

Success focus: make resume carry the behavior boundary so a fresh Agent does
not widen scope after interruption, and so atom tasks remain aligned with
available product intent and accepted evidence.

Depends on: C003.

Acceptance focus:

- Allowed and forbidden actions are explicit.
- Owned paths, forbidden paths, validation commands, and commit evidence
  expectations are visible when available.
- Resume says to stop when boundaries cannot be established.
- Product-alignment context is exposed when available so local implementation
  does not drift away from vision evidence.

### C005 - Expose resume in runtime surface and documentation

Status: candidate

Risk: medium

Purpose: update source-generated guidance, runtime verification, and docs so
Agents know when to use `resume --json`.

Success focus: make `resume` the documented first recovery command for a fresh
Agent, distinct from lower-level `handoff`, `context`, `inspect`, and `status`.
Guidance should frame resume as minimal-context precision recovery, not generic
autonomous retry.

Depends on: C004.

Acceptance focus:

- Docs cover interrupted-session recovery after network loss, context overflow,
  compaction failure, or unexpected termination.
- Generated guidance can point a fresh Agent to resume without requiring human
  explanation of the breakpoint.
- Docs describe OW recovery as ranked atom-task continuation with correction and
  product-alignment boundaries.

## Deferred

- Artifact lineage graph: `M107-artifact-lineage-graph`
- Consistency-first prompt2proto strategy: `M108-consistency-first-split-later-prompt2proto`
- Provider and fallback generation metadata: `M109-provider-fallback-generation-metadata`
- Boundary preflight compiler: `M110-boundary-preflight-compiler`
- Vision-product drift minimization loop:
  `M111-vision-product-drift-minimization`
- Project `SOUL.md` and `MEMORY.md` evolution:
  `M112-project-soul-memory`
