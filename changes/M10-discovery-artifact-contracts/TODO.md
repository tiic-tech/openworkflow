# M10 TODO

M10 must keep artifact design small, auditable, and useful to the next agent
that loads the repo with limited context.

## Plan

1. Define artifact responsibilities and progressive disclosure levels.
2. Add a core registry for discovery artifact contracts.
3. Add JSON Schemas for the registry and discovery artifact YAML files.
4. Generate artifact audit files during `openworkflow init`.
5. Render artifact contract guidance into generated `/ow:*` commands.
6. Validate initialized repos and root project artifacts.

## Task Decomposition

- `M10-T001`: Write the artifact contract reference and first-consumer rules.
- `M10-T002`: Add `packages/core/src/artifacts/registry.ts`.
- `M10-T003`: Add schemas for artifact registry, disclosure levels, and discovery artifacts.
- `M10-T004`: Generate `.openworkflow/audit/ARTIFACT_CONTRACTS.yaml` and `.openworkflow/audit/DISCLOSURE_LEVELS.yaml`.
- `M10-T005`: Update command docs and validation rules.
- `M10-T006`: Run build, smoke init, sync, doctor, CLI validate, and repo validate.

## Completion Checklist

- [x] Reference document exists.
- [x] Artifact registry exists.
- [x] Discovery artifact schemas exist.
- [x] Init writes artifact contract audit files.
- [x] Workflow index and contract graph reference artifact audit files.
- [x] Generated discovery commands list artifact contracts.
- [x] Validators require M10 audit files.
- [x] Validators check known discovery artifact shapes.
- [x] Full validation passes.
