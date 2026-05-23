# M114 Engineering Quality Foundation Candidate Changes

Source of truth: `CANDIDATE_CHANGES.yaml`

Status: active; C002 completed after `M115-internal-coder-quality-governance`

Branch boundary: `codex/m101-build-proto-prompt-command-split`

## Scope

This queue pauses product-stage expansion and establishes the engineering
quality foundation needed for OpenWorkflow to behave like a trustworthy
Agent-facing developer tool.

The immediate defect is trust-signal drift: `handoff` and `inspect --strict`
can be green while broad repository validation is red. The fix is not to make
one command hide the other. The fix is to define validation domains, make
reports explicit about their scope, and then refactor validators and verifiers
inside those boundaries.

In scope:

- trust-domain taxonomy
- validation report classification
- path safety consolidation
- validator and verifier split points
- structural verification over prose-only checks
- one typed contract source-model pilot
- scan-budget visibility for entry commands

Out of scope:

- M70 adapter-delivery follow-up work
- M107-M111 product-stage expansion
- spicyclaw rename/productization
- provider-backed generation
- SOUL/MEMORY implementation
- generated `.agents/**` edits as durable fixes

## Baseline

Current trust evidence:

- `node dist/cli/src/index.js handoff --root . --json`: pass
- `node dist/cli/src/index.js inspect --root . --strict --json`: pass
- `npm run validate`: fail
- `ow_quality_snapshot.mjs`: reports oversized source files, raw path-prefix
  checks, type escapes, synchronous validator filesystem checks, and
  substring-heavy assertions.

The current validation failures are baseline quality debt. They must remain
visible until classified or fixed.

## Selection Policy

Selected candidate: none.

Next recommended candidate: C003.

M114 has resumed after M115 established the internal coder protocol boundary.
C001 has completed the domain taxonomy; C002 has completed the shared
path-safety helper slice.

## Candidates

### C001 - Define Validation Trust Domains And Report Taxonomy

Status: done

Risk: medium

Purpose: define the domain model that explains what each trust command covers,
what it does not cover, and how Agents should interpret narrower green signals
when broader validation domains are red.

Acceptance focus:

- Names every validation and trust domain.
- Maps Agent-facing trust commands to intended domains and non-domains.
- Records the current `npm run validate` failure classes as baseline debt.
- Does not change runtime behavior or validator pass/fail behavior.

Selection artifacts:

- `changes/M114-engineering-quality-foundation/C001-define-validation-trust-domains-and-report-taxonomy/SELECTED_CHANGE.yaml`
- `changes/M114-engineering-quality-foundation/C001-define-validation-trust-domains-and-report-taxonomy/ATOM_TASKS.yaml`
- `changes/M114-engineering-quality-foundation/C001-define-validation-trust-domains-and-report-taxonomy/IMPLEMENTATION_BRIEF.md`

Completion:

- Added `references/validation-trust-domains.md`.
- Recorded entry trust, summary health, managed surface health, source contract
  validation, active queue health, historical archive health, fixture corpus
  health, and release readiness domains.
- Classified current `npm run validate` failures as baseline repository quality
  debt without changing validator behavior.
- Local commit evidence:
  `changes/M114-engineering-quality-foundation/C001-define-validation-trust-domains-and-report-taxonomy/LOCAL_COMMIT_EVIDENCE.yaml`

### C002 - Introduce Shared Path-Safety And Local-Reference Helpers

Status: done

Risk: medium

Purpose: centralize root containment and repo-local reference resolution.

Depends on: C001.

Selection artifacts:

- `changes/M114-engineering-quality-foundation/C002-shared-path-safety-local-reference-helpers/SELECTED_CHANGE.yaml`
- `changes/M114-engineering-quality-foundation/C002-shared-path-safety-local-reference-helpers/ATOM_TASKS.yaml`
- `changes/M114-engineering-quality-foundation/C002-shared-path-safety-local-reference-helpers/IMPLEMENTATION_BRIEF.md`

Completion:

- Added shared fs helpers for root-contained paths and local references.
- Added targeted RED/GREEN fixture coverage for relative escapes, prefix
  collisions, absolute paths, external refs, missing files, and valid refs.
- Replaced one repository-contract validator local-reference call site while
  preserving behavior-compatible diagnostics.
- Local commit evidence:
  `changes/M114-engineering-quality-foundation/C002-shared-path-safety-local-reference-helpers/LOCAL_COMMIT_EVIDENCE.yaml`

### C003 - Split Repository Validation Into Explicit Domain Sections

Status: ready

Risk: medium

Purpose: classify broad validation failures by trust domain and caller
relevance without hiding failures.

Depends on: C001.

### C004 - Extract High-Churn Artifact And Queue Validators From God Files

Status: candidate

Risk: medium

Purpose: extract one cohesive validation domain from the large repository
validator files.

Depends on: C001, C003.

### C005 - Replace Priority Brittle Verifier Assertions With Structural Checks

Status: ready

Risk: medium

Purpose: convert one high-value structured verifier section from substring
checks to parsed-object assertions.

Depends on: C001.

### C006 - Create Typed Protocol Source Model For One Command Or Artifact Family

Status: candidate

Risk: high

Purpose: pilot one typed source model that renders and validates a command or
artifact family from one owner.

Depends on: C001, C005.

High-risk note: this can affect generated/report surfaces and needs a decision
report before selection.

### C007 - Add Entry-Command Performance And Scan-Budget Reporting

Status: candidate

Risk: medium

Purpose: make broad scans visible and measurable for Agent entry commands.

Depends on: C001, C003.
