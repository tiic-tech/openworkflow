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

Next recommended candidate: `C001`

Selected candidate: `C001`

## Current Candidates

### C001 - Define Workflow Command Taxonomy And Stage Graph

Status: `selected`

Risk: `medium`

Purpose: define the workflow command taxonomy and stage graph before any new
runtime command implementation.

Owned paths:

- `references/workflow-blueprint-runtime-alignment.md`
- `changes/M73-workflow-blueprint-runtime-alignment/C001-workflow-command-taxonomy/`
- `changes/M73-workflow-blueprint-runtime-alignment/`

Validation:

- `npm run validate`
- `git diff --check`

## Deferred Feature Refs

These are intentionally not current candidates. Each needs a later DTC pass
with its own queue boundary.

- `M74-proto2html-runtime-contract`: proto2html runtime contract
- `M75-html2spec-artifact-contract`: html2spec artifact contract
- `M76-build-command-contract`: build command team and milestone planning
- `M77-change-planning-loop`: /ow:change orchestration with DTC/AC/SC
- `M78-review-async-pipeline`: async review command pipeline
- `M79-archive-completion-transaction`: archive completion transaction
- `M80-build-agent-skill-registry`: build-agent and build-skill registry semantics
- `M81-workflow-lifecycle-transactions`: workflow lifecycle transaction map
- `M82-expanded-workflow-read-model`: expanded summary-first read model

## Operation Audit

- `OP001`: initially added C001-C010 from OW_DEVELOP_PLAN and C013 reassessment.
- `OP002`: selected C001 after AC recommendation.
- `OP003`: removed C002-C010 from active candidates and preserved them as
  deferred feature refs after scope-control review.
