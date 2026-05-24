# C011 Implementation Brief

## Goal

Deliver the accepted planning command ids through the Codex generated skill
adapter.

## Read First

- `changes/M54-decompose-select-change-planning/HIGH_RISK_DECISION_REPORT.md`
- `changes/M54-decompose-select-change-planning/C010-planning-registry-semantics/SELECTED_CHANGE.yaml`
- `changes/M54-decompose-select-change-planning/C011-codex-planning-adapter/SELECTED_CHANGE.yaml`
- `references/planning-skill-runtime-exposure.md`

## Do

- Register `/ow:decompose-to-changes`, `/ow:analyze-changes`, and
  `/ow:select-change` in the source command registry.
- Keep each command's protocol aligned with the source skill boundary.
- Run `openworkflow sync` to generate `.agents` and `.openworkflow` managed
  surfaces.
- Update verification to cover the generated planning skills.
- Record queue selection and completion evidence.

## Do Not

- Do not hand-edit generated `.agents/**` or `.openworkflow/**`.
- Do not add non-Codex adapter delivery.
- Do not mutate remote git or GitHub state.
- Do not collapse analyze-changes into decompose-to-changes or select-change.

## Owned Paths

- `packages/core/src/commands/registry.ts`
- `packages/core/src/onboarding/agentsGuide.ts`
- `packages/cli/src/index.ts`
- `packages/cli/src/dev/verifyRuntimeSurface.ts`
- `references/planning-skill-runtime-exposure.md`
- `.agents/`
- `.openworkflow/audit/COMMAND_AUDIT_INDEX.yaml`
- `.openworkflow/audit/CONTEXT_PACKETS.yaml`
- `AGENTS.md`
- `changes/M54-decompose-select-change-planning/`

## Validation

```bash
npm run validate
npm run verify:runtime-surface
npm run verify:agent-e2e
git diff --check
```

## Stop Conditions

- Stop if generated parity requires weakening validators.
- Stop before C013 unless the user explicitly approves the next high-risk
  reassessment.
