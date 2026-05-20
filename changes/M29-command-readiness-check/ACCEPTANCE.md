# M29 Acceptance

- `openworkflow check <command> --root <folder>` reports readiness for a repo-local `/ow:*` workflow command.
- Command input accepts `/ow:spec`, `ow:spec`, and `ow-spec` forms.
- `--json` emits the shared M28 JSON envelope with readiness data under `data`.
- The readiness data includes context requirements, output boundaries, blockers, warnings, and next actions.
- Missing required context and existing forbidden context produce blockers and non-zero exit status.
- CURRENT_STATE.next_command mismatch is a warning when no blocker exists.
- The command is read-only and does not create stage artifacts.
- `openworkflow --help` and AGENTS.md managed block mention `check`.

Validation target:

```bash
npm run validate
npm run verify:runtime-surface
npm run verify:e2e-workflow
npm run verify:clean
```
