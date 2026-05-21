# OpenWorkflow Development Plan - Phase 2

Date: 2026-05-21

## Phase 2 Thesis

OpenWorkflow's core advantage is not that it creates many workflow artifacts.
Its core advantage is that an Agent can obtain high-quality, trustworthy
development intelligence from a small amount of context.

Phase 2 exists to protect that advantage while OW grows.

The product must remain:

- **auditable**: every important action has evidence.
- **traceable**: decisions, artifacts, commits, branches, PRs, and risks connect
  through stable ids.
- **low-context**: the default Agent path reads compact control surfaces first.
- **high-signal**: every artifact answers a distinct operational question.
- **safe to consume**: Agents can trust state, boundaries, risks, and next
  actions without guessing.

This document is the Phase 2 planning brief. It supplements
`docs/OW_DEVELOP_PLAN.md`, which remains the broad long-term roadmap.

## Phase 1 Review

The recent dogfood cycle proved that OW can use OW to develop itself.

Implemented or materially proven:

- image-first `/ow:proto` and dedicated `/ow:tune` split
- `proto2html` source skill and dogfood reconstruction evidence
- `decompose-to-changes` source skill
- `select-change` source skill
- candidate queue maintenance by stable id and operation logs
- `analyze-changes` for cross-queue read-only priority analysis
- high-risk decision report contract and stop behavior
- local branch, local commit, and PR-ready summary governance
- managed `ow:git-automation` shell
- read-only autonomous simulator
- remote read-only PR-ready planning
- disabled-by-default draft PR pilot gate
- commit evidence as selected-change traceability

The dogfood cycle also exposed the next product risk: as the workflow adds
`html2spec`, `build`, runtime review, archive, devlog, learning, and release
surfaces, artifact volume can grow faster than Agent consumption quality.

Phase 2 must therefore focus on information architecture before adding a large
number of new downstream commands.

## First-Consumer Experience Report

As the first consuming Agent, OW feels strongest when it gives me one compact
answer to each operational question:

- What is the current workflow state?
- Which queue owns the current feat?
- Which candidate should be selected next?
- What is the risk level?
- What files may I touch?
- What validation proves the work?
- What commit records the selected change?
- What should the next Agent read first?

OW feels weaker when completion requires several manual maintenance steps:

- update `CANDIDATE_CHANGES.yaml`
- update `CANDIDATE_CHANGES.md`
- update `SELECTED_CHANGE.yaml`
- create `LOCAL_COMMIT_EVIDENCE.yaml`
- update `SUMMARY.yaml`
- regenerate `PR_READY_SUMMARY.md`
- run validation
- commit evidence

That workflow is auditable, but it is still too manual. If Phase 2 adds more
artifact types without transaction automation, the maintenance burden will
eventually erode trust.

## KANO Matrix

| Category | Features | Phase 2 Assessment |
|---|---|---|
| Must-be | source-of-truth YAML, stable ids, status, operation logs, completion evidence | Protect and validate aggressively; this is OW's trust foundation. |
| Must-be | branch boundary, dirty-tree checks, commit evidence, PR-ready summary | Keep mandatory for dogfood-governed development. |
| Must-be | high-risk reports and explicit approval gates | Required for remote git, adapter delivery, runtime exposure, merge, Issue mutation, release, and autonomous execution. |
| Must-be | summary freshness and current pointers | Must become stricter as artifacts grow. |
| Performance | `decompose-to-changes`, `select-change`, `analyze-changes` | Continue hardening; these are the planning intelligence layer. |
| Performance | `handoff`, `context`, `summaries`, `doctor`, `validate` | Make them stronger default entrypoints so Agents avoid full-tree reads. |
| Performance | lifecycle transaction commands | Highest Phase 2 leverage; reduce missed maintenance actions. |
| Attractive | autonomous simulator, remote-plan, draft-pr dry-run gate | Valuable safety affordances; keep mutation explicit and narrow. |
| Attractive | dogfood loop | Continue using OW to improve OW; every friction should become candidate evidence. |
| Reverse | unbounded artifact creation | Can destroy low-context consumption if not controlled. |
| Reverse | manual completion maintenance | Auditable but error-prone; must be replaced by explicit OW-native transactions. |
| Reverse | legacy queues without branch boundaries | Creates governance ambiguity when old work is reactivated. |

## Phase 2 Design Principles

### 1. Artifact Budget

Every artifact must earn its place.

Before adding an artifact type, answer:

- What question does it uniquely answer?
- Is it source of truth, view, summary, index, evidence, cache, or archive?
- Does it enter default Agent context?
- What summary or current slice protects context budget?
- When does it become superseded, archived, compacted, or obsolete?

If two artifacts answer the same operational question, merge them or define a
strict hierarchy.

### 2. One Source Of Truth Per Stage

Each workflow stage should have one authoritative source artifact. Other files
may be summaries, indexes, evidence, or readable views.

Examples:

- candidate planning: `CANDIDATE_CHANGES.yaml`
- selected change: `SELECTED_CHANGE.yaml`
- cross-queue priority: `CHANGE_ANALYSIS.yaml`
- high-risk decision: `HIGH_RISK_DECISION_REPORT.md`
- PR handoff: `PR_READY_SUMMARY.md` as review packet, not source of truth

### 3. Summary-First Consumption

Agents should default to L0/L1 control surfaces:

- `CURRENT_STATE.yaml`
- command JSON
- `SUMMARY.yaml`
- `CHANGE_ANALYSIS.yaml`
- `NEXT_CHANGE.yaml`
- `OPEN_BLOCKERS.yaml`
- `PR_READY_SUMMARY.md` when reviewing a feat branch

Raw evidence should be loaded only when the summary is missing, stale,
disputed, or insufficient for the active command.

### 4. Transactional Completion

Completion maintenance must become explicit and automatable.

The target is not hidden Git hooks. The target is OW-native transactions with
dry-run, write, validation, effect reporting, and rollback guidance.

First transaction commands to design:

```text
openworkflow transaction complete-change --root . --queue <queue> --candidate <id> --write --json
openworkflow transaction record-commit --root . --queue <queue> --candidate <id> --commit <hash> --write --json
openworkflow transaction refresh-handoff --root . --queue <queue> --write --json
```

These should update the correct artifacts together:

- queue status and completion evidence
- selected change completion
- local commit evidence
- summary
- PR-ready summary
- indexes or current pointers where applicable

Git hooks may be optional later, but they should not be the foundation. Hidden
hooks can surprise users, mutate files during manual commits, and make evidence
harder to attribute.

### 5. Policy Before Autonomy

Autonomy must remain bounded by policy:

- allowed operations
- forbidden operations
- allowed write paths
- validation requirements
- remote mutation gates
- rollback expectations
- escalation criteria

No autonomous loop should run without a visible policy and structured status.

### 6. Legacy Queue Reconciliation

Old queues created before branch governance are still valuable. They should not
be treated as invalid, but reactivating them should require a reconciliation
step:

- confirm or add `queue_policy.branch_boundary`
- record current branch and reason
- decide whether to continue on the current branch or create a new feat branch
- update analysis and selection artifacts with the branch decision

## Phase 2 Development Goals

### Goal A - Cross-Queue Selection Becomes Native

Current status:

- `analyze-changes` can produce `CHANGE_ANALYSIS.yaml`.
- `select-change` still needs stronger ability to consume that analysis and
  arbitrate across multiple queues.

Next change:

- `M54/C007`: Support cross-queue selection arbitration.

Acceptance direction:

- `select-change` can consume `CHANGE_ANALYSIS.yaml`.
- selection records rejected alternatives by `plan_id` and `candidate_id`.
- branch-boundary mismatch is surfaced before selection.
- high-risk alternatives trigger report/approval paths.

### Goal B - Lifecycle Transactions

Current status:

- Completion is auditable but too manual.
- M68 has `H007` as a candidate for lifecycle transaction design.

Phase 2 direction:

- promote lifecycle transaction design after `M54/C007`.
- define dry-run/write transaction reports.
- make completion maintenance reproducible.
- later integrate transaction mode into `ow:git-automation commit`.

### Goal C - Artifact Economy Contracts

Current status:

- `docs/OW_DEVELOP_PLAN.md` already names information architecture and
  anti-bloat budgets.
- The rules are not yet operationalized as contracts or validation.

Phase 2 direction:

- define artifact roles: source, view, summary, index, evidence, cache, archive.
- add context budget fields to command protocols.
- make default read level explicit.
- add summary freshness and stale-source gates where missing.

### Goal D - Post-Prototype Chain Without Artifact Swamp

Current status:

- `/ow:proto` and `/ow:tune` are image-first.
- `proto2html` source behavior and dogfood exist.
- runtime exposure for proto2html remains high risk.
- `html2spec` and `build` are not yet implemented.

Phase 2 direction:

- do not add a broad `html2spec -> build` artifact explosion yet.
- first define compact handoff contracts:
  - locked HTML prototype
  - fidelity report
  - HTML-to-build intelligence packet
  - open questions
  - build slicing suggestions
- expand into detailed specs only when they answer distinct build questions.

### Goal E - Runtime Exposure Checklist

Current status:

- Several high-risk candidates involve generated runtime surfaces:
  - planning skills runtime exposure
  - proto2html runtime exposure
  - future adapter delivery

Phase 2 direction:

- require high-risk report before runtime exposure.
- require generated-surface ownership checks.
- require runtime and agent E2E verification.
- require context budget and artifact lifecycle notes before exposing a new
  command.

### Goal F - Code Intelligence As Optional Provider

Current status:

- `docs/OW_DEVELOP_PLAN.md` identifies codegraph as a possible future
  code-intelligence provider.

Phase 2 direction:

- keep code-intel optional.
- consume compact OW summaries, not raw provider state.
- use code-intel later for guard, review, archive, release, and handoff.

### Design Note - Internal Commands As Future Agent-Team Tasks

Decision record, 2026-05-22:

OW is still in the first synchronous implementation pass. During this pass,
internal command boundaries should be made explicit before adding asynchronous
runtime behavior.

The `/ow:proto` split is the first concrete example:

- user-facing `/ow:proto` remains the orchestration command.
- internal `/ow:vision2prompt` compiles validated vision into strategic prompt
  text artifacts.
- internal `/ow:prompt2proto` consumes prompt text and produces prototype
  image assets with metadata.
- future `/ow:tune` can similarly route through an internal
  `/ow:tune-proto-prompt` stage before reusing prompt-to-prototype generation.

The future built-in Agent Team layer should be able to assign these internal
stages to dedicated subagents. The orchestrating Agent would load the
user-facing command, then spawn the appropriate subagent for each internal
stage. This should reduce main-Agent context pressure, improve isolation
between independent tasks, and preserve attention quality while keeping the
audit trail attached to the same OW command chain.

This is a later runtime architecture direction, not a current M86 requirement.
The current requirement is to define clean internal command contracts and
artifact handoffs so asynchronous execution can be added without redesigning
the discovery loop.

## Immediate Priority Recommendation

The current cross-queue analysis recommends:

```text
M54-decompose-select-change-planning / C007
```

Reason:

`C007` is medium risk, ready, dependency-satisfied, and directly strengthens
the exact capability Phase 2 needs: choosing correctly across multiple active
candidate queues without losing auditability.

Before selecting it, reconcile the M54 queue with current git governance:

- confirm or add `queue_policy.branch_boundary`
- decide whether the work should happen on a new `codex/m54-*` branch or be
  explicitly maintained from the current branch as a documented exception

## Proposed Phase 2 Sequence

1. `M54/C007`: native cross-queue selection arbitration.
2. Legacy queue branch-boundary reconciliation for reactivated queues.
3. Lifecycle transaction design, likely via `M68/H007` or a new dedicated queue.
4. Transaction commands for completion and commit evidence.
5. Artifact economy contract and context budget fields.
6. Runtime exposure checklist for high-risk generated surfaces.
7. Reassess `M68/H003` proto2html runtime exposure with a high-risk report.
8. Design compact `html2spec -> build` handoff before implementing new command
   surfaces.

## Non-Goals For Phase 2

- Do not implement a full autonomous milestone loop yet.
- Do not add broad `html2spec`, `build`, `archive`, `review`, `devlog`, and
  `learn` surfaces all at once.
- Do not make Git hooks the primary transaction mechanism.
- Do not let narrative artifacts enter default operational context.
- Do not treat remote mutation approval as approval for merge, Issue mutation,
  force-push, or full autonomy.

## Success Criteria

Phase 2 succeeds when a fresh Agent can enter the OW repo and, with minimal
context, answer:

- which queue is active?
- which candidate is recommended and why?
- what alternatives were rejected?
- what risk gate applies?
- what branch should own the work?
- what artifacts will be updated by completion?
- what validation proves the update?
- what commit records the change?
- what should the next Agent read first?

The success measure is not artifact count. The success measure is whether OW
preserves clarity as artifact count grows.
