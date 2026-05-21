# Candidate Changes: Workflow Blueprint Runtime Alignment

Source of truth: `CANDIDATE_CHANGES.yaml`

This Markdown file is the human-readable view. If it conflicts with the YAML,
the YAML wins.

## Scope Boundary

This queue owns one workflow slice: command taxonomy and stage graph alignment.
It does not own implementation or detailed contracts for individual runtime
surfaces.

Main blueprint:

```text
vision -> validation -> proto -> tune -> proto2html -> html2spec -> build -> change -> archive
```

DTC, AC, and SC are the planning intelligence layer inside `/ow:change`, not
the whole workflow.

Branch boundary: `codex/m73-workflow-blueprint-runtime-alignment`

Next recommended candidate: `C014`

## Current Candidates

### C011 - Define Command Family Taxonomy

Status: `done`

Risk: `low`

Purpose: define primary, internal planning, advanced, and asynchronous command
families without runtime registry or adapter changes.

Owned paths:

- `references/workflow-blueprint-runtime-alignment.md`
- `changes/M73-workflow-blueprint-runtime-alignment/`

### C012 - Define Workflow Stage Graph

Status: `done`

Risk: `low`

Depends on: `C011`

Purpose: define the main workflow stage graph and optional tune/supporting
surface attachment points.

### C013 - Define /ow:change Planning Intelligence Boundary

Status: `selected`

Risk: `medium`

Depends on: `C011`, `C012`

Purpose: place DTC, AC, and SC inside `/ow:change` while keeping `/ow:change`
as the implementation orchestration boundary.

### C014 - Define Deferred Feature Handoff Map

Status: `candidate`

Risk: `medium`

Depends on: `C011`, `C012`, `C013`

Purpose: preserve future queue hints and risk gates for runtime surfaces that
are outside M73.

## Superseded Candidates

### C001 - Define Workflow Command Taxonomy And Stage Graph

Status: `superseded`

Reason: split into C011-C014 after DTC scope review. Historical selection
artifacts remain under `C001-workflow-command-taxonomy/` but should not be used
as the next implementation boundary.

## Deferred Feature Refs

These are intentionally not current candidates. Each needs a later DTC pass
with its own queue boundary.

- `M74-front-chain-command-quality-review`: re-review vision, validation, proto,
  and tune before downstream implementation work
- `M75-proto2html-runtime-contract`: proto2html runtime contract
- `M76-html2spec-artifact-contract`: html2spec artifact contract
- `M77-build-command-contract`: build command team and milestone planning
- `M78-change-planning-loop`: /ow:change orchestration with DTC/AC/SC
- `M79-review-async-pipeline`: async review command pipeline
- `M80-archive-completion-transaction`: archive completion transaction
- `M81-build-agent-skill-registry`: build-agent and build-skill registry semantics
- `M82-workflow-lifecycle-transactions`: workflow lifecycle transaction map
- `M83-expanded-workflow-read-model`: expanded summary-first read model

## Operation Audit

- `OP001`: initially added C001-C010 from OW_DEVELOP_PLAN and C013 reassessment.
- `OP002`: selected C001 after AC recommendation.
- `OP003`: removed C002-C010 from active candidates and preserved them as
  deferred feature refs after scope-control review.
- `OP004`: split selected C001 into C011-C014 and marked C001 superseded.
- `OP005`: updated C014 deferred handoff map so front-chain command quality
  review precedes proto2html.
- `OP006`: selected C011 after AC recommendation.
- `OP007`: completed C011 with local commit evidence.
- `OP008`: selected C012 after AC recommendation.
- `OP009`: completed C012 with local commit evidence.
- `OP010`: selected C013 directly with SC because M73 is the single active queue.
