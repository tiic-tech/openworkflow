# M97 Smart City Product-Reality Dogfood

Source of truth: `CANDIDATE_CHANGES.yaml`

Status: complete

Target repo: `/Users/archy/Projects/StartUp/smart_city_copilot`

Target branch: `codex/smart-city-product-reality-e2e`

Branch boundary: `codex/m73-workflow-blueprint-runtime-alignment`

## Scope

Return to the smart city target repo and pressure test the repaired M93
discovery-to-prototype chain. The queue proves whether the chain now produces a
map-first smart city operations product instead of the rejected generic AI
governance dashboard.

This queue is not the place to implement OpenWorkflow source fixes. It records
target-repo dogfood evidence first, then decomposes any follow-up fixes into a
later queue.

## Candidates

| ID | Status | Risk | Title | Dependencies |
| --- | --- | --- | --- | --- |
| C001 | done | medium | Reconcile smart city target repo with M93 dist CLI | none |
| C002 | done | medium | Re-run smart city discovery to prompt-pack reality gate | C001 |
| C003 | done | medium | Generate local deterministic product-reality prototype batch | C002 |
| C004 | done | medium | Audit M97 dogfood outcome and decompose follow-ups | C002, C003 |

## Next Recommendation

No next candidate is selected. C001-C004 are complete: the target repo was
reconciled on the new E2E branch, M97 prompt-pack reality gate passed, the local
deterministic D1-D3 prototype batch preserves map-first product topology, and
the audit-only closure report is written. This E2E run stops at first image
generation and does not advance into product design.

## Deferred

- `M98-smart-city-dogfood-followups`
- `M96-prototype-visual-quality-review-gate`
- `M91-proto2html-benchmark-input`

## Candidate Details

### C001 - Reconcile Smart City Target Repo With M93 Dist CLI

Purpose: establish a clean target-repo baseline under the repaired local dist
CLI before generating new artifacts.

Validation:

- `node /Users/archy/Projects/StartUp/openworkflow/dist/cli/src/index.js sync --root /Users/archy/Projects/StartUp/smart_city_copilot --json`
- `node /Users/archy/Projects/StartUp/openworkflow/dist/cli/src/index.js validate --root /Users/archy/Projects/StartUp/smart_city_copilot --json`
- `node /Users/archy/Projects/StartUp/openworkflow/dist/cli/src/index.js summaries --root /Users/archy/Projects/StartUp/smart_city_copilot --strict --json`
- `node /Users/archy/Projects/StartUp/openworkflow/dist/cli/src/index.js handoff --root /Users/archy/Projects/StartUp/smart_city_copilot --json`
- `git -C /Users/archy/Projects/StartUp/smart_city_copilot status --short --branch`

### C002 - Re-run Smart City Discovery To Prompt-Pack Reality Gate

Purpose: drive a fresh smart city chain through vision, validation, strategic
prompt pack, product experience model, and `prototype_reality_gate`.

### C003 - Generate Local Deterministic Product-Reality Prototype Batch

Purpose: if C002 passes, generate the next local deterministic prototype batch
and review whether it preserves map-first product topology.

### C004 - Audit M97 Dogfood Outcome And Decompose Follow-ups

Purpose: audit the target repo artifacts through first image generation as a
first consumer and split any OpenWorkflow fixes into a follow-up queue.

Audit report: `/Users/archy/Projects/StartUp/smart_city_copilot/docs/M97_PRODUCT_REALITY_E2E_AUDIT_REPORT.md`
