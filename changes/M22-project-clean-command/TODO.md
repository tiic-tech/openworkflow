# M22 TODO

M22 adds a project-level `openworkflow clean` command. This is distinct from
`npm uninstall -g @tiic-tech/openworkflow`, which removes the global CLI package.

## Plan

1. [x] Document `openworkflow clean` as the selected project cleanup command.
2. [x] Add CLI routing and help text for `clean`.
3. [x] Implement dry-run-by-default cleanup planning.
4. [x] Implement `--yes` deletion for `.openworkflow`.
5. [x] Implement generated-marker cleanup for `.agents` Codex adapter files.
6. [x] Preserve non-generated `.agents` and `.codex` files unless explicitly safe.
7. [x] Add verifier coverage for dry-run, deletion, and preservation behavior.
8. [x] Run full validation.

## Completion Checklist

- [x] Project cleanup command is `openworkflow clean`.
- [x] `clean` does not uninstall the npm package.
- [x] Dry-run is the default.
- [x] Destructive cleanup requires `--yes`.
- [x] Generated OpenWorkflow project files are removed.
- [x] Non-generated project files are preserved.
- [x] Full validation passes.
