# M74 Front-Chain Command Quality Review

Source of truth: `CANDIDATE_CHANGES.yaml`.

This queue reviews the existing front-chain commands `/ow:vision`,
`/ow:validation`, `/ow:proto`, and `/ow:tune` as Agent-first artifact
production surfaces. It does not implement downstream commands such as
`proto2html`, `html2spec`, `build`, `review`, or `archive`.

## Selection Policy

Prefer changes that improve low-context Agent consumption, preserve workflow
order, define strict acceptance and stress tests, and keep generated surfaces
synced from source-of-truth changes.

Avoid bundling multiple command repairs into one candidate, expanding into
downstream command contracts, or using `analyze-changes` while this is the only
active candidate queue.

Branch boundary: `codex/m73-workflow-blueprint-runtime-alignment`

Selected candidate: `C001`

Next recommended candidate: none until `C001` is completed or superseded.

## Agent-First Review Lens

The Agent is OW artifacts' first consumer. A successful command should help the
Agent orient, decide, act, verify, and hand off with very little context. The
best command output should feel like a native development instrument, not
paperwork.

Every command review must answer:

- What is the current state?
- What should the Agent read first?
- What context is required, optional, or forbidden?
- What artifact is source of truth, summary, evidence, or view?
- What can the Agent safely modify?
- What is blocked, stale, risky, or missing?
- What validation proves the command behaved correctly?
- What next command or handoff is appropriate?

## Candidates

### C001 - Review and enhance /ow:vision for Agent-first consumption

Status: `selected`

Risk: `medium`

Owns `/ow:vision` registry protocol, vision artifact contracts, summary health,
verification surfaces, generated `ow-vision` adapter synchronization, and audit
metadata produced by `sync`.

Acceptance requires normal and failed-flow stress coverage, explicit
source-of-truth and current-slice behavior, clear handoff guidance, and compact
artifacts that let a low-context Agent understand durable product intent.

Selection: `C001-review-enhance-vision`

### C002 - Review and enhance /ow:validation for Agent-first consumption

Status: `candidate`

Risk: `medium`

Owns `/ow:validation` source skill, validation target artifacts, registry
protocol, schema and verification surfaces, generated `ow-validation` adapter
synchronization, and audit metadata produced by `sync`.

Acceptance requires stress coverage for absent vision context, conflicting or
thin summaries, malformed validation targets, dirty-tree friction where
relevant, and clear `ok:false` failures.

### C003 - Review and enhance /ow:proto for Agent-first consumption

Status: `candidate`

Risk: `medium`

Owns `/ow:proto` source skill, prototype prompt/evidence/summary behavior,
registry protocol, schema and verification surfaces, generated `ow-proto`
adapter synchronization, and audit metadata produced by `sync`.

Acceptance requires a low-context Agent to determine current prototype evidence,
trust state, review boundary, and whether the next action is `/ow:tune` or
`/ow:proto2html`.

### C004 - Review and enhance /ow:tune for Agent-first consumption

Status: `candidate`

Risk: `medium`

Owns `/ow:tune` source skill, tune input/output and decision audit behavior,
registry protocol, schema and verification surfaces, generated `ow-tune` and
decision-adjacent adapter synchronization, and audit metadata produced by
`sync`.

Acceptance requires clear repeatable loop boundaries, protection against silent
product-thesis changes, stress coverage for malformed or stale tune evidence,
and a dependable handoff to either another tune loop or `proto2html`.

## Deferred Features

- `M75-proto2html-runtime-contract`
- `M76-html2spec-artifact-contract`
- `M77-build-command-contract`
- `M78-change-planning-loop`
- `M79-review-async-pipeline`
- `M80-archive-completion-transaction`
- `M81-build-agent-skill-registry`
- `M82-workflow-lifecycle-transactions`
- `M83-expanded-workflow-read-model`
