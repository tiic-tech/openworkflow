# M11 TODO

M11 must make discovery artifacts easy to author and reliable to resume from
without adding heavy review UI or production-stage scope.

## Plan

1. Define authoring template and active pointer rules.
2. Extend the artifact registry with template and read policy metadata.
3. Generate stage-local YAML templates during `openworkflow init`.
4. Render template and read policy guidance into generated discovery commands.
5. Validate required templates and active pointer consistency.
6. Run full verification.

## Task Decomposition

- `M11-T001`: Write the artifact authoring reference and implementation TODO.
- `M11-T002`: Extend `packages/core/src/artifacts/registry.ts`.
- `M11-T003`: Generate `_templates/*.yaml` files and enrich `ARTIFACT_CONTRACTS.yaml`.
- `M11-T004`: Update generated command docs with template and read policy guidance.
- `M11-T005`: Add template and active pointer validation in CLI/root validators.
- `M11-T006`: Verify build, init, sync, doctor, CLI validate, and repo validate.

## Completion Checklist

- [x] Reference document exists.
- [x] Artifact registry includes template paths.
- [x] Artifact registry includes read policy and context budget fields.
- [x] Artifact registry includes active pointer metadata.
- [x] Init writes all discovery artifact YAML templates.
- [x] Artifact contract audit file includes M11 metadata.
- [x] Generated discovery commands display template path and read policy.
- [x] Validators require generated templates.
- [x] Validators check non-null active pointers.
- [x] Full validation passes.
