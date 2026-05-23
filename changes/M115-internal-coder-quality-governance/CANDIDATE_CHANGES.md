# Candidate Changes: M115 Internal Coder Quality Governance

`CANDIDATE_CHANGES.yaml` is the source of truth. This Markdown file is the
readable view for Agent and human review.

## Priority

This queue is higher priority than `M114-engineering-quality-foundation`.
M114 should pause before C002 until the internal coder governance contract is
selected and established. The reason is direct: coder governance is the
execution protocol that should constrain M114 and future implementation work.

## Boundary

`/ow:coder` is an internal, Agent-only code execution governance protocol. It is
not a normal user-facing workflow entry and does not replace `/ow:change` or
`/ow:team`.

In scope:

- code-change preflight
- owner, file, and dependency map expectations
- RED evidence before production changes
- GREEN evidence after fixes
- post-write self-check
- validation ladder selection
- evidence binding
- source-policy growth from repeated quality lessons

Primary C001 contract:

- `references/internal-coder-protocol.md`

Out of scope:

- a user-facing "write code" command
- replacement of `/ow:change` or `/ow:team`
- mandatory `CODER_EVIDENCE.yaml` before the protocol is proven
- unrelated M114 refactors

## Selection Policy

`C001`, `C002`, and `C003` are complete. `/ow:coder` is now registered as an
internal command protocol with source-driven generated surfaces. `C004` and
`C005` and `C007` are complete. The remaining forward path is C006, which can
introduce an optional evidence artifact contract only after the C005
guidance-only fields prove stable.

High-risk stop: candidates that alter public CLI JSON semantics, expose
`/ow:coder` as a normal user command, enforce new commit gates, or add
persistent evidence schemas require a high-risk decision packet unless scoped
as internal-only and behavior-compatible.

## Candidates

### C001: Define internal coder protocol contract and command boundary

- Status: `done`
- Risk: `medium`
- Size: `small`
- Purpose: define `/ow:coder` as an internal, Agent-only governance protocol
  without runtime behavior changes.
- Owns: `changes/M115-internal-coder-quality-governance/`, `references/`
- Unlocks: `C002`, `C003`, `C004`, `C005`
- Acceptance: contract states internal-only semantics, required gates,
  integration points, and non-goals; no generated or runtime behavior changes.
- Selection: `C001-define-internal-coder-protocol-contract-and-command-boundary`
- Completion: `references/internal-coder-protocol.md`

### C002: Migrate code-quality governor into OW source coder skill

- Status: `done`
- Risk: `medium`
- Size: `medium`
- Purpose: move durable OW-specific quality governance into repo-owned source
  skill material.
- Owns: `skills/`, `references/`, `packages/core/src/onboarding/`,
  `changes/M115-internal-coder-quality-governance/`
- Depends on: `C001`
- Unlocks: `C003`, `C004`, `C007`
- Selection: `C002-migrate-code-quality-governor-into-ow-source-coder-skill`
- Completion: `skills/coder/SKILL.md`

### C003: Register internal `/ow:coder` command protocol

- Status: `done`
- Risk: `medium`
- Size: `medium`
- Purpose: add an internal registry command with `visibility: internal` and no
  user-facing workflow entry.
- Owns: `packages/core/src/commands/registry.ts`,
  `packages/core/src/adapters/`, `packages/cli/src/dev/verifyRuntimeSurface.ts`,
  `skills/`, `.agents/skills/`,
  `changes/M115-internal-coder-quality-governance/`
- Depends on: `C001`, `C002`
- Unlocks: `C004`, `C005`
- Selection: `C003-register-internal-ow-coder-command-protocol`
- Completion: internal registry command plus generated `ow-coder` skill

### C004: Wire coder governance into change and team protocols

- Status: `done`
- Risk: `medium`
- Size: `medium`
- Purpose: make `/ow:change` and `/ow:team` reference coder governance without
  changing their primary responsibilities.
- Owns: `packages/core/src/commands/registry.ts`, `skills/select-change/`,
  `skills/run-team/`, `packages/cli/src/dev/verifyRuntimeSurface.ts`,
  `.agents/skills/ow-change/`, `.agents/skills/ow-team/`,
  `.openworkflow/audit/COMMAND_AUDIT_INDEX.yaml`,
  `.openworkflow/audit/CONTEXT_PACKETS.yaml`,
  `changes/M115-internal-coder-quality-governance/`
- Depends on: `C002`, `C003`
- Unlocks: `C005`
- Selection:
  `C004-wire-coder-governance-into-change-and-team-protocols`
- Completion: source protocol and generated skill guidance for coder preflight,
  RED/GREEN evidence, post-write self-check, validation ladder, and evidence
  binding

### C005: Surface coder gate state in recovery and git governance

- Status: `done`
- Risk: `high`
- Size: `medium`
- Purpose: expose whether coder gates were required, completed, skipped, or
  missing in recovery and commit-evidence flows.
- Owns: `packages/cli/src/commands/resume.ts`, `packages/core/src/workflow/`,
  `packages/core/src/git/`, `packages/core/src/workflow/summaryHealth.ts`,
  `packages/cli/src/dev/verifyRuntimeSurface.ts`,
  `changes/M115-internal-coder-quality-governance/`
- Depends on: `C003`, `C004`
- Unlocks: `C006`, `C007`
- Selection:
  `C005-surface-coder-gate-state-in-recovery-and-git-governance`
- Completion: guidance-only `coder_gate` state in resume/read models and local
  commit evidence

### C006: Introduce optional coder evidence artifact contract

- Status: `candidate`
- Risk: `high`
- Size: `medium`
- Purpose: define optional `CODER_EVIDENCE.yaml` or commit-evidence embedding
  only after protocol and read-model fields are proven.
- Owns: `references/`, `packages/core/src/artifacts/`,
  `packages/core/src/validators/`, `packages/cli/src/dev/verifyRuntimeSurface.ts`,
  `changes/M115-internal-coder-quality-governance/`
- Depends on: `C005`

### C007: Add coder continuous growth loop for reusable lessons

- Status: `done`
- Risk: `medium`
- Size: `small`
- Purpose: define how recurring quality lessons become durable OW source
  policy without becoming unmanaged memory.
- Owns: `skills/`, `references/`,
  `changes/M115-internal-coder-quality-governance/`
- Depends on: `C002`
- Selection:
  `C007-add-coder-continuous-growth-loop-for-reusable-lessons`
- Completion: `references/coder-continuous-growth-loop.md` plus coder skill
  linkage

## Deferred

- User-facing `/ow:coder-review` or `/ow:quality`.
- Project-local `SOUL.md` and `MEMORY.md` promotion layer.
- Mandatory coder evidence enforcement across all queues.

## Validation

Initial queue creation should be validated with:

- `node dist/cli/src/index.js handoff --root . --json`
- `node dist/cli/src/index.js inspect --root . --strict --json`
- `node dist/cli/src/index.js resume --root . --json`
- `git diff --check`
