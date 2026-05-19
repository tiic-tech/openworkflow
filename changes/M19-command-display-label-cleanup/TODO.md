# M19 TODO

M19 cleans up Codex interface display labels without changing command semantics.

## Plan

1. [x] Generate `display_name: ow:<id>` in skill interface metadata.
2. [x] Preserve `/ow:<id>` semantic command text in skill docs and audit contracts.
3. [x] Add runtime surface verification for slashless display names.
4. [x] Run full validation.

## Completion Checklist

- [x] Codex UI labels omit leading slash.
- [x] Semantic command triggers still include leading slash.
- [x] Explicit skill invocation remains `$ow-<id>`.
- [x] Full validation passes.
